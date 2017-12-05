import { ExportMap } from "./ExportMap";
import { Printer } from "./Printer";
import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { Entity } from "./Entity";
import { Enum } from "./Enum";

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
    this.printEnums()
    this.printMessages()

    return this.printer.getOutput();
  }

  private printImports(){
    this.fileDescriptor.getDependencyList().forEach((dependency: string) => {
      const pkgModule = this.exportMap.findPkgModule(dependency)
      this.printer.printLn(`import * as ${pkgModule.aliasName} from "./${pkgModule.importName}";`);
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
}


