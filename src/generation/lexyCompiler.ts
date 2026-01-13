import type {ILogger} from "../infrastructure/logger";
import type {IComponentNode} from "../language/componentNode";

import {CompilerResult} from "./compilerResult";
import {CompilationEnvironment, ICompilationEnvironment} from "./javaScript/compilationEnvironment";
import {generateJavaScriptCode} from "./javaScript/generateJavaScriptCode";
import {ILibraries} from "../functionLibraries/libraries";
import {Assert} from "../infrastructure/assert";

export interface ILexyCompiler {
  compile(nodes: readonly IComponentNode[]): CompilerResult;
}

export class LexyCompiler implements ILexyCompiler {

  private readonly libraries: ILibraries;
  private readonly compilationLogger: ILogger;
  private readonly executionLogger: ILogger;

   constructor(compilationLogger: ILogger, executionLogger: ILogger, libraries: ILibraries) {
     this.compilationLogger = Assert.notNull(compilationLogger, "compilationLogger");
     this.executionLogger = Assert.notNull(executionLogger, "executionLogger");
     this.libraries = Assert.notNull(libraries, "libraries");
   }

   public compile(nodes: readonly IComponentNode[]): CompilerResult {
     let environment = new CompilationEnvironment(this.compilationLogger, this.executionLogger, this.libraries);
     try {
       this.generateCode(nodes, environment);
       environment.initialize();
       return environment.result();
     } catch (error: any) {
       this.compilationLogger.logError(`Exception occurred during compilation: ` + error.stack);
       throw error;
     }
   }

   private generateCode(generateNodes: readonly IComponentNode[], environment: ICompilationEnvironment): void {
     generateNodes.map(node => LexyCompiler.generateType(node, environment));
   }

   private static generateType(node: IComponentNode, environment: ICompilationEnvironment): void {
     let generatedType = generateJavaScriptCode(node);
     if (generatedType == null) return;
     environment.addType(generatedType);
   }
}
