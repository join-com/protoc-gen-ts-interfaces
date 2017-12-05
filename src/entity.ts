import { MessageEntity, EnumEntity } from "./ExportMap";
import { Printer } from "./Printer";
import { Field } from './Field'

export class Entity {
  private readonly printer: Printer
  readonly pkgModuleName: string
  readonly messageEntities: MessageEntity[]
  readonly enumEntities: EnumEntity[]

  constructor(pkgModuleName: string, messageEntities: MessageEntity[], enumEntities: EnumEntity[]) {
    this.printer = new Printer(0);
    this.pkgModuleName = pkgModuleName
    this.messageEntities = messageEntities
    this.enumEntities = enumEntities
  }

  public print(messageEntity: MessageEntity) {
    const field = new Field(this.printer, this.pkgModuleName, this.messageEntities, this.enumEntities)
    this.printer.printEmptyLn();
    this.printer.printLn(`export interface ${messageEntity.printName} {`);
    messageEntity.descriptor.getFieldList().forEach((msgField) => field.printField(msgField))
    this.printer.printLn(`}`);

    return this.printer.getOutput();
  }
}
