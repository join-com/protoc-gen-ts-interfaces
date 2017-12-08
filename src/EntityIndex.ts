import {
  FileDescriptorProto,
  DescriptorProto,
  EnumDescriptorProto
} from "google-protobuf/google/protobuf/descriptor_pb";

export interface Entity {
  name: string
  printName: string
  moduleName: string
  resultFieldType: string | undefined
}

export class EntityIndex {
  messageEntities: Entity[] = [];

  constructor(fileDescriptorProto: FileDescriptorProto[]) {
    fileDescriptorProto.forEach((protoFileDescriptor: FileDescriptorProto) => {
      this.addFileDescriptor(protoFileDescriptor);
    })
  }

  addMessage(moduleName: string, message: DescriptorProto | EnumDescriptorProto) {
    const msg: any = message.toObject()
    const hasResultField = msg.fieldList.find((field: any) => field.name === 'result')
    const messageEntity: Entity = {
      name: msg.name as string,
      printName: `I${msg.name}`,
      moduleName,
      resultFieldType: hasResultField && hasResultField.typeName
    }
    this.messageEntities.push(messageEntity)
  }

  addEnum(moduleName: string, message: DescriptorProto | EnumDescriptorProto) {
    const messageEntity: Entity = {
      name: message.getName(),
      printName: message.getName(),
      resultFieldType: undefined,
      moduleName
    };
    this.messageEntities.push(messageEntity)
  }

  addFileDescriptor(fileDescriptor: FileDescriptorProto) {
    fileDescriptor.getMessageTypeList().forEach(messageType => {
      this.addMessage(fileDescriptor.getName(), messageType);
    });

    fileDescriptor.getEnumTypeList().forEach(enumType => {
      this.addEnum(fileDescriptor.getName(), enumType);
    });
  }

  findMessageEntity(msgName: string): Entity {
    return this.messageEntities.filter(({ name }) => (name === msgName))[0]
  }

}
