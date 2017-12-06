import { MessageEntity } from "./ExportMap";
import { Printer } from "./Printer";
import { ServiceDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { Method } from "./Method";
export class Service {
  private readonly printer: Printer
  readonly pkgModuleName: string
  readonly messageEntities: MessageEntity[]

  constructor(pkgModuleName: string, messageEntities: MessageEntity[]) {
    this.printer = new Printer(0);
    this.pkgModuleName = pkgModuleName
    this.messageEntities = messageEntities
  }

  public print(serviceDescriptor: ServiceDescriptorProto) {
    this.printer.printEmptyLn();
    this.printer.printLn(`export interface I${serviceDescriptor.getName()} {`);
    serviceDescriptor.getMethodList().forEach((methodDescriptor) =>{
      const method = new Method(this.printer, this.messageEntities, this.pkgModuleName)
      method.print(methodDescriptor)
    })
    this.printer.printLn(`}`);

    return this.printer.getOutput();
  }
}
