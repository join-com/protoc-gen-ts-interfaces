import { ExportMap } from "./ExportMap";
import { Printer } from "./Printer";
import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { printEntity } from "./entity";
import { printEnum } from "./enum";

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
      this.printer.print(printEnum(enumType));
    });
  }

  private printMessages(){
    this.fileDescriptor.getMessageTypeList().forEach(messageType => {
      const messageEntry = this.exportMap.findMessageEntity(messageType.getName(), this.fileName)
      this.printer.print(printEntity(this.fileDescriptor.getName(), messageEntry, this.exportMap.messageEntities, this.exportMap.enumEntities));
    });
  }
}


