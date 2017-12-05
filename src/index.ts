import { CodeGeneratorRequest, CodeGeneratorResponse } from "google-protobuf/google/protobuf/compiler/plugin_pb";
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

const getCodeGenRequest = async () => {
  const inputBuff = await allStdinBuffer()
  const typedInputBuff = new Uint8Array(inputBuff.length);
  typedInputBuff.set(inputBuff);
  return CodeGeneratorRequest.deserializeBinary(typedInputBuff);
}

const generateFile = (fileName: string, exportMap: ExportMap, codeGenResponse: CodeGeneratorResponse) => {
  const pkgModule = exportMap.findPkgModule(fileName)
  const fileGenerator = new FileGenerator(pkgModule.fileDescriptor, exportMap)
  const outputFileName = fileName.replace(".proto", ".ts")
  const thisFile = new CodeGeneratorResponse.File();
  thisFile.setName(outputFileName);
  thisFile.setContent(fileGenerator.print());
  codeGenResponse.addFile(thisFile);
}

const main = async (): Promise<void> => {
  try {
    const codeGenRequest = await getCodeGenRequest();
    const exportMap = new ExportMap(codeGenRequest.getProtoFileList());
    const codeGenResponse = new CodeGeneratorResponse();

    codeGenRequest.getFileToGenerateList().forEach((fileName) => {
      generateFile(fileName, exportMap, codeGenResponse)
    })

    process.stdout.write(new Buffer(codeGenResponse.serializeBinary()));
  } catch (err) {
    console.error("protoc-gen-ts-interfaces error: " + err.stack + "\n");
    process.exit(1);
  }
}

main()
