import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface Documento {
  id: number;
  nome: string;
  tipo: 'DOCUMENTO' | 'NORMA';
  url: string;
  createdAt: string;
}

const DB_PATH = path.join(process.cwd(), 'documentos.json');

function readDb(): Documento[] {
  if (!fs.existsSync(DB_PATH)) return [];
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDb(docs: Documento[]) {
  fs.writeFileSync(DB_PATH, JSON.stringify(docs, null, 2));
}

@Injectable()
export class DocumentosService {
  findAll(tipo?: string) {
    const docs = readDb();
    if (tipo) return docs.filter((d) => d.tipo === tipo);
    return docs;
  }

  create(nome: string, tipo: 'DOCUMENTO' | 'NORMA', url: string) {
    const docs = readDb();
    const doc: Documento = {
      id: docs.length > 0 ? Math.max(...docs.map((d) => d.id)) + 1 : 1,
      nome,
      tipo,
      url,
      createdAt: new Date().toISOString(),
    };
    docs.push(doc);
    writeDb(docs);
    return doc;
  }
}
