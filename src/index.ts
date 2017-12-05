import { CodeGeneratorRequest, CodeGeneratorResponse } from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { ExportMap } from "./ExportMap";
import { FileGenerator } from "./FileGenerator";

const allStdinBuffer = (): Promise<Buffer> => new Promise((resolve, reject) => {
  const ret: Buffer[] = [];
  let len = 0;

  const stdin = process.stdin;
  stdin.on("readable", function () {
    let chunk;

    while ((chunk = stdin.read())) {
      if (!(chunk instanceof Buffer)) reject(new Error("Did not receive buffer"));
      ret.push(chunk as Buffer);
      len += chunk.length;
    }
  });

  stdin.on("end", function () {
    resolve(Buffer.concat(ret, len));
  });
})

const main = async (): Promise<void> => {
  try {
    const fileNameToDescriptor: { [key: string]: FileDescriptorProto } = {};

    const inputBuff = await allStdinBuffer()
    const typedInputBuff = new Uint8Array(inputBuff.length);
    typedInputBuff.set(inputBuff);
    const codeGenRequest = CodeGeneratorRequest.deserializeBinary(typedInputBuff);
    const codeGenResponse = new CodeGeneratorResponse();
    const exportMap = new ExportMap();
    codeGenRequest.getProtoFileList().forEach((protoFileDescriptor: FileDescriptorProto) => {
      fileNameToDescriptor[protoFileDescriptor.getName()] = protoFileDescriptor;
      exportMap.addFileDescriptor(protoFileDescriptor);
    })
    codeGenRequest.getFileToGenerateList().forEach((fileName) => {
      const fileGenerator = new FileGenerator(fileNameToDescriptor[fileName], exportMap)
      const outputFileName = fileName.replace(".proto", ".ts")
      const thisFile = new CodeGeneratorResponse.File();
      thisFile.setName(outputFileName);
      thisFile.setContent(fileGenerator.print());
      codeGenResponse.addFile(thisFile);
    })
    process.stdout.write(new Buffer(codeGenResponse.serializeBinary()));
  } catch (err) {
    console.error("protoc-gen-ts-interfaces error: " + err.stack + "\n");
    process.exit(1);
  }
}

main()
