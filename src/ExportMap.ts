import {
  FileDescriptorProto,
  DescriptorProto,
  MessageOptions,
  EnumDescriptorProto
} from "google-protobuf/google/protobuf/descriptor_pb";

export interface EnumEntity {
  pkgModule: PkgModule
  name: string
  printName: string
  descriptor: EnumDescriptorProto
}

export interface MessageEntity {
  pkgModule: PkgModule
  name: string
  printName: string
  descriptor: DescriptorProto
  messageOptions: MessageOptions
}

export interface PkgModule {
  name: string
  pkg: string
  importName: string
  aliasName: string
  fileDescriptor: FileDescriptorProto
}

export function aliasName(filePath: string): string {
  return filePath.replace(".proto", "").split("/").slice(-1)[0];
}

export class ExportMap {
  enumEntities: EnumEntity[] = [];
  messageEntities: MessageEntity[] = [];
  pkgModules: PkgModule[] = [];

  constructor(fileDescriptorProto: FileDescriptorProto[]) {
    fileDescriptorProto.forEach((protoFileDescriptor: FileDescriptorProto) => {
      this.addFileDescriptor(protoFileDescriptor);
    })
  }

  addMessageWithNested(pkgModule: PkgModule, message: DescriptorProto) {
    const messageEntity: MessageEntity = {
      pkgModule,
      name: message.getName(),
      printName: `I${message.getName()}`,
      descriptor: message,
      messageOptions: message.getOptions(),
    };
    this.messageEntities.push(messageEntity)
    message.getNestedTypeList().forEach(nested => {
      this.addMessageWithNested(pkgModule, nested);
    });
  }

  addEnum(pkgModule: PkgModule, enumDescriptor: EnumDescriptorProto) {
    const messageEntity: EnumEntity = {
      pkgModule,
      name: enumDescriptor.getName(),
      printName: enumDescriptor.getName(),
      descriptor: enumDescriptor
    };
    this.enumEntities.push(messageEntity)
  }

  addFileDescriptor(fileDescriptor: FileDescriptorProto) {
    const pkgModule: PkgModule = {
      pkg: fileDescriptor.getPackage(),
      name: fileDescriptor.getName(),
      importName: fileDescriptor.getName().replace(".proto", ""),
      aliasName: aliasName(fileDescriptor.getName()),
      fileDescriptor
    }

    this.pkgModules.push(pkgModule)
    fileDescriptor.getMessageTypeList().forEach(messageType => {
      this.addMessageWithNested(pkgModule, messageType);
    });

    fileDescriptor.getEnumTypeList().forEach(enumType => {
      this.addEnum(pkgModule, enumType);
    });
  }

  findPkgModule(pkgName: string): PkgModule {
    return this.pkgModules.filter(({ name }) => name === pkgName)[0]
  }

  findMessageEntity(msgName: string, pkgName: string): MessageEntity {
    return this.messageEntities.filter(({ name, pkgModule }) => (name === msgName && pkgModule.name === pkgName))[0]
  }

  findEnum(enumName: string, pkgName: string): EnumEntity {
    return this.enumEntities.filter(({ name, pkgModule }) => (name === enumName && pkgModule.name === pkgName))[0]
  }

}
