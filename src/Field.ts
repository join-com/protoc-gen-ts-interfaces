import { FieldDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { Printer } from "./Printer";
import { MessageEntity, EnumEntity } from "./ExportMap";
import { MESSAGE_TYPE, ENUM_TYPE, getTypeName } from "./FieldTypes";

const SPECIFIC_TYPES: { [index: string]: string } = {
  DoubleValue: "number",
  FloatValue: "number",
  Int64Value: "number",
  UInt64Value: "number",
  Int32Value: "number",
  UInt32Value: "number",
  BoolValue: "boolean",
  StringValue: "string",
  BytesValue: "Uint8Array"
}

export class Field {
  readonly printer: Printer
  readonly pkgModuleName: string
  readonly messageEntities: MessageEntity[]
  readonly enumEntities: EnumEntity[]

  constructor(printer: Printer, pkgModuleName: string, messageEntities: MessageEntity[],
    enumEntities: EnumEntity[]) {
    this.printer = printer
    this.pkgModuleName = pkgModuleName
    this.messageEntities = messageEntities
    this.enumEntities = enumEntities
  }

  public printField (field: FieldDescriptorProto) {
    const fieldType = field.getType();
    const fieldTypeName = field.getTypeName().split('.').slice(-1)[0]
    const fieldName = this.snakeToCamel(field.getName())
    if (fieldType === MESSAGE_TYPE) {
      this.printMessage(fieldName, fieldTypeName)
    } else if (fieldType === ENUM_TYPE) {
      this.printEnum(fieldName, fieldTypeName)
    } else {
      this.printer.printIndentedLn(`${fieldName}: ${getTypeName(fieldType)}`)
    }
  }

  private snakeToCamel(str: string): string {
    return str.replace(/(\_\w)/g, function (m) {
      return m[1].toUpperCase();
    });
  }

  private fieldWithLocalType(fieldName: string, messageEntity: MessageEntity | EnumEntity): string {
    return `${fieldName}: ${messageEntity.printName}`
  }


  private fieldWithExternalType(fieldName: string, messageEntity: MessageEntity | EnumEntity): string {
    return `${fieldName}: ${messageEntity.pkgModule.aliasName}.${messageEntity.printName}`
  }

  private isSpecificType(messageEntity: MessageEntity) {
    return Object.keys(SPECIFIC_TYPES).indexOf(messageEntity.name) !== -1
  }


  private fieldWithSpecificType(fieldName: string, nestedMessageEntity: MessageEntity, ){
    return `${fieldName}?: ${SPECIFIC_TYPES[nestedMessageEntity.name]} | null`
  }

  private printMessage(fieldName: string, fieldTypeName: string){
    const nestedMessageEntity: MessageEntity = this.messageEntities.filter(({ name }) => name === fieldTypeName)[0]
    if (this.isSpecificType(nestedMessageEntity)) {
      this.printer.printIndentedLn(this.fieldWithSpecificType(fieldName, nestedMessageEntity))
    } else if (nestedMessageEntity.pkgModule.name === this.pkgModuleName) {
      this.printer.printIndentedLn(this.fieldWithLocalType(fieldName, nestedMessageEntity))
    } else {
      this.printer.printIndentedLn(this.fieldWithExternalType(fieldName, nestedMessageEntity))
    }
  }

  private printEnum(fieldName: string, fieldTypeName: string) {
    const nestedEnumEntity: EnumEntity = this.enumEntities.filter(({ name }) => name === fieldTypeName)[0]
    if (nestedEnumEntity.pkgModule.name === this.pkgModuleName) {
      this.printer.printIndentedLn(this.fieldWithLocalType(fieldName, nestedEnumEntity))
    } else {
      this.printer.printIndentedLn(this.fieldWithExternalType(fieldName, nestedEnumEntity))
    }
  }
}



