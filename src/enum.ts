import {EnumDescriptorProto} from "google-protobuf/google/protobuf/descriptor_pb";
import {Printer} from "./Printer";

export class Enum {
  private readonly printer: Printer
  constructor() {
    this.printer = new Printer(0);
  }

  public print(enumDescriptor: EnumDescriptorProto) {
    this.printer.printEmptyLn();
    this.printer.printLn(`export enum ${enumDescriptor.getName()} {`);
    enumDescriptor.getValueList().forEach(value => {
      this.printer.printIndentedLn(`${value.getName().toUpperCase()} = "${value.getName().toUpperCase()}",`);
    });
    this.printer.printLn(`}`);
    return this.printer.getOutput();
  }
}
