import type { X2jOptions, XmlBuilderOptions } from "fast-xml-parser";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();
const fileName = process.argv[3];
if (!fileName) throw "Filename to patch should be specified";
const junitPath = join(cwd, fileName);

const alwaysArray = ["testsuites.testsuite", "testsuites.testsuite.testcase"];
const xmlOptions: X2jOptions & XmlBuilderOptions = {
  ignoreAttributes: false,
  allowBooleanAttributes: true,
  attributeNamePrefix: "attr_",
  isArray: (_, jpath) => alwaysArray.includes(jpath),
};

const parser = new XMLParser(xmlOptions);
const rawJunit = readFileSync(junitPath, "utf8");
const output = parser.parse(rawJunit);

const { testsuites } = output;
if (!testsuites?.testsuite) {
  console.error(output);
  throw Error(`junit.xml is invalid`);
}

testsuites.testsuite = testsuites.testsuite.map((testsuite: any) => {
  const hostnamePrefix = `${testsuite.attr_hostname} \u{203A} `;
  testsuite.attr_name = hostnamePrefix + testsuite.attr_name;

  const { testcase } = testsuite;
  testsuite.testcase = testcase.map((innerCase: any) => {
    innerCase.attr_name = hostnamePrefix + innerCase.attr_name;
    return innerCase;
  });
  return testsuite;
});

const builder = new XMLBuilder({ ...xmlOptions, format: true });
const processedJunit = builder.build(output);
writeFileSync(junitPath, processedJunit);
