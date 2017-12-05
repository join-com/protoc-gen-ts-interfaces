export class Printer {
  private readonly indentStr: string;
  private output: string = "";

  constructor(indentLevel: number = 0) {
    this.indentStr = this.generateIndent(indentLevel);
  }

  public printLn(str: string) {
    this.output += this.indentStr + str + "\n";
  }

  public print(str: string) {
    this.output += str;
  }

  public printEmptyLn() {
    this.output += "\n";
  }

  public printIndentedLn(str: string) {
    this.output += this.indentStr + "  " + str + "\n";
  }

  public getOutput(): string {
    return this.output;
  }

  private generateIndent(indentLevel: number): string {
    let indent = "";
    for (let i = 0; i < indentLevel; i++) {
      indent += "  "
    }
    return indent;
  }

}
