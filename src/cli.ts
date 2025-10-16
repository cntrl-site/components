#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { config } from 'dotenv';
import { program } from 'commander';
import { Client } from './sdk/Client/Client';
import { Layout } from './sdk/types/project/Layout';

program
  .command('generate-layouts')
  .option('-o, --output <outputFilePath>', 'Output file path', 'cntrl.scss')
  .option('-e, --env <envFilename>', 'Name of the .env file', '.env.local')
  .action(async (options) => {
    try {
      config({ path: options.env });
      const templateFilePath = path.resolve(__dirname, '../resources/template.scss.ejs');
      const scssTemplate = fs.readFileSync(templateFilePath, 'utf-8');
      const apiUrl = process.env.CNTRL_API_URL;
      if (!apiUrl) {
        throw new Error('Environment variable "CNTRL_API_URL" must be set.');
      }
      const client = new Client(apiUrl);
      const layouts = await client.getLayouts();
      const ranges = convertLayouts(layouts);

      const compiledTemplate = ejs.compile(scssTemplate);
      const renderedTemplate = compiledTemplate({ ranges });
      const outputFilePath = path.resolve(process.cwd(), options.output);
      fs.writeFileSync(outputFilePath, renderedTemplate);

      console.log(`Generated .scss file at ${outputFilePath}`);
    } catch (error) {
      console.error('An error occurred:', error);
      process.exit(1);
    }
  });

function convertLayouts(layouts: Layout[], maxLayoutWidth: number = Number.MAX_SAFE_INTEGER): LayoutRange[] {
  const sorted = layouts.slice().sort((la, lb) => la.startsWith - lb.startsWith);
  const mapped = sorted.map<LayoutRange>((layout, i, ls) => {
    const next = ls[i + 1];
    return {
      start: layout.startsWith,
      end: next ? next.startsWith - 1 : maxLayoutWidth,
      exemplary: layout.exemplary,
      name: layout.title,
      isFirst: i === 0,
      isLast: !next
    };
  });
  return mapped;
}

export interface LayoutRange {
  /** closed range [start, end] */
  start: number;
  end: number;
  exemplary: number;
  name: string;
  isFirst: boolean;
  isLast: boolean;
}

program.parse(process.argv);
