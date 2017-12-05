import { MessageEntity, EnumEntity } from "./ExportMap";
import { Printer } from "./Printer";
import { Field } from './Field'

export const printEntity = (pkgModuleName: string, messageEntity: MessageEntity, messageEntities: MessageEntity[], enumEntities: EnumEntity[]) => {
  const printer = new Printer(0);
  const field = new Field(printer, pkgModuleName, messageEntities, enumEntities)
  printer.printEmptyLn();
  printer.printLn(`export interface ${messageEntity.printName} {`);
  messageEntity.descriptor.getFieldList().forEach((msgField) => field.printField(msgField))
  printer.printLn(`}`);

  return printer.getOutput();
}
