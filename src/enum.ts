import {EnumDescriptorProto} from "google-protobuf/google/protobuf/descriptor_pb";
import {Printer} from "./Printer";

export function printEnum(enumDescriptor: EnumDescriptorProto) {
  const printer = new Printer(0);
  printer.printEmptyLn();
  printer.printLn(`export enum ${enumDescriptor.getName()} {`);
  enumDescriptor.getValueList().forEach(value => {
    printer.printIndentedLn(`${value.getName().toUpperCase()} = "${value.getName().toUpperCase()}",`);
  });
  printer.printLn(`}`);
  return printer.getOutput();
}
