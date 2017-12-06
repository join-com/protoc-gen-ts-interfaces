import { ExportMap } from "./ExportMap";
import { Printer } from "./Printer";
import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { Entity } from "./Entity";
import { Enum } from "./Enum";
import { Service } from "./Service";
import { Client } from "./Client";

const SPECIFIC_IMPORT_TYPES = [
  "google/protobuf/timestamp.proto",
  "google/protobuf/wrappers.proto",
  "google/protobuf/empty.proto",
  "google/protobuf/any.proto"
]

export class FileGenerator {
  private readonly fileDescriptor: FileDescriptorProto
  private readonly exportMap: ExportMap
  private readonly printer: Printer
  private readonly fileName: string

  constructor(fileDescriptor: FileDescriptorProto, exportMap: ExportMap) {
    this.fileDescriptor = fileDescriptor
    this.exportMap = exportMap
    this.printer = new Printer(0);
    this.fileName = this.fileDescriptor.getName();
  }

  public print() {
    this.printImports()
    this.printServices()
    this.printClient()
    this.printEnums()
    this.printMessages()

    return this.printer.getOutput();
  }

  private printImports(){
    if (this.fileDescriptor.getServiceList().length > 0) {
      this.printer.printLn(`import { Client } from "../src/grpc/client";`);
    }
    this.fileDescriptor.getDependencyList().forEach((dependency: string) => {
      if (SPECIFIC_IMPORT_TYPES.indexOf(dependency) === -1) {
        const pkgModule = this.exportMap.findPkgModule(dependency)
        this.printer.printLn(`import * as ${pkgModule.aliasName} from "./${pkgModule.importName}";`);
      }
    });

  }

  private printEnums(){
    this.fileDescriptor.getEnumTypeList().forEach(enumType => {
      const enumPrinter = new Enum()
      this.printer.print(enumPrinter.print(enumType));
    });
  }

  private printMessages(){
    this.fileDescriptor.getMessageTypeList().forEach(messageType => {
      const messageEntry = this.exportMap.findMessageEntity(messageType.getName(), this.fileName)
      const entity = new Entity(this.fileDescriptor.getName(), this.exportMap.messageEntities, this.exportMap.enumEntities)
      this.printer.print(entity.print(messageEntry));
    });
  }

  private printServices() {
    this.fileDescriptor.getServiceList().forEach(service => {
      const svc = new Service(this.fileDescriptor.getName(), this.exportMap.messageEntities)
      this.printer.print(svc.print(service));
    });
  }

  private printClient() {
    this.fileDescriptor.getServiceList().forEach(service => {
      const client = new Client(this.fileDescriptor.getName(), this.exportMap.messageEntities)
      this.printer.print(client.print(service));
    });
  }
}


