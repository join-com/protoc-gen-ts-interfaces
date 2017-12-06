import { MethodDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { Printer } from "./Printer";
import { MessageEntity } from "./ExportMap";
export class ClientMethod {
  private readonly printer: Printer
  readonly messageEntities: MessageEntity[]
  readonly pkgModuleName: string

  constructor(printer: Printer, messageEntities: MessageEntity[], pkgModuleName: string) {
    this.printer = printer;
    this.messageEntities = messageEntities
    this.pkgModuleName = pkgModuleName
  }

  public print(methodDescriptor: MethodDescriptorProto) {
    const inputMgsEntity = this.findEntity(methodDescriptor.getInputType())
    const outputMgsEntity = this.findEntity(methodDescriptor.getOutputType())
    const inputMgsText = inputMgsEntity.pkgModule.name === this.pkgModuleName ? inputMgsEntity.printName : `${inputMgsEntity.pkgModule.aliasName}.${inputMgsEntity.printName }`
    const outputMgsText = outputMgsEntity.pkgModule.name === this.pkgModuleName ? outputMgsEntity.printName : `${outputMgsEntity.pkgModule.aliasName}.${outputMgsEntity.printName}`
    this.printer.printIndentedLn(`public ${this.toLower(methodDescriptor.getName())}(req: ${inputMgsText}): Promise<${outputMgsText}> {`);
    this.printer.printIndentedLn(`  return super.makeRequest('${this.toLower(methodDescriptor.getName())}', req)`)
    this.printer.printIndentedLn('}');
    return this.printer.getOutput();
  }

  private toLower(name: string) {
    return name.charAt(0).toLowerCase() + name.slice(1);
  }

  private findEntity(msgName: string): MessageEntity {
    const nameWithoutPkg = msgName.split('.').slice(-1)[0]
    const messageEntity: MessageEntity = this.messageEntities.filter(({ name }) => name === nameWithoutPkg)[0]
    return messageEntity
  }
}
