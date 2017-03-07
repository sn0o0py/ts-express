
import * as program from 'commander';
import * as path from 'path';
import { MetadataGenerator } from './metadataGeneration/metadataGenerator';
import { SpecGenerator } from './swaggerGeneration/specGenerator';
import * as fs from 'fs';


program.version('0.0.1');

program.command('gen <entryFile> <outPutDir>')
    .action((entryFile, outPutDir) => {
        entryFile = path.join(process.cwd(), entryFile);
        outPutDir = path.join(process.cwd(), outPutDir);

        let generator = new MetadataGenerator(entryFile);

        let schema = generator.Generate();

        let spegGen = new SpecGenerator(schema, { basePath: '/' });

        let swaggerJson = spegGen.GetSpec();

        fs.writeFile(path.join(outPutDir, "./swagger.json"), JSON.stringify(swaggerJson, null, 4), function (err) {
            if (!err) {
                console.log("success!");
                process.exit();
            } else {
                console.error(err);
                process.exit(1);
            }
        });
    });

program.parse(process.argv);