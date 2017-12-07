import {
  FileDescriptorProto,
  DescriptorProto,
  EnumDescriptorProto
} from "google-protobuf/google/protobuf/descriptor_pb";

export interface Entity {
  name: string
  printName: string
  moduleName: string
}

export class EntityIndex {
  messageEntities: Entity[] = [];

  constructor(fileDescriptorProto: FileDescriptorProto[]) {
    fileDescriptorProto.forEach((protoFileDescriptor: FileDescriptorProto) => {
      this.addFileDescriptor(protoFileDescriptor);
    })
  }

  addMessage(moduleName: string, message: DescriptorProto | EnumDescriptorProto, isEnum = false) {
    const messageEntity: Entity = {
      name: message.getName(),
      printName: isEnum ? message.getName() : `I${message.getName()}`,
      moduleName
    };
    this.messageEntities.push(messageEntity)
  }

  addFileDescriptor(fileDescriptor: FileDescriptorProto) {
    fileDescriptor.getMessageTypeList().forEach(messageType => {
      this.addMessage(fileDescriptor.getName(), messageType);
    });

    fileDescriptor.getEnumTypeList().forEach(enumType => {
      this.addMessage(fileDescriptor.getName(), enumType, true);
    });
  }

  findMessageEntity(msgName: string): Entity {
    return this.messageEntities.filter(({ name }) => (name === msgName))[0]
  }

}
