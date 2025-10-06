import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Hace que el servicio esté disponible en toda la app
})
export class Dataset {
  // Parsea el archivo a un array de objetos
  async parseFile(file: File): Promise<any[]> {
    // Medir tiempo de lectura de archivo
    performance.mark('start-file-read');
    const text = await file.text();
    performance.mark('end-file-read');
    performance.measure('file-read-time', 'start-file-read', 'end-file-read');
    
    // Medir tiempo de parsing JSON
    performance.mark('start-json-parse');
    let data = JSON.parse(text);
    if (!Array.isArray(data)) {
      data = Object.values(data);
    }
    performance.mark('end-json-parse');
    performance.measure('json-parse-time', 'start-json-parse', 'end-json-parse');
    
    return data;
  }
  // Filtra los datos por texto
  async filterData(data: any[], filter: string): Promise<any[]> {
    performance.mark('start-filter-operation');
    let result;
    if (!filter) {
      result = [...data];
    } else {
      const f = filter.toLowerCase();
      result = data.filter(item => JSON.stringify(item).toLowerCase().includes(f));
    }
    performance.mark('end-filter-operation');
    performance.measure('filter-operation-time', 'start-filter-operation', 'end-filter-operation');
    return result;
  }
  
  // Ordena los datos por el campo 'id' (numérico) o 'name' (alfabético)
  async sortData(data: any[], by: 'id' | 'name' = 'id'): Promise<any[]> {
    performance.mark('start-sort-operation');
    let result;
    if (!data.length) {
      result = data;
    } else if (by === 'id' && data[0].id !== undefined) {
      result = [...data].sort((a, b) => a.id - b.id);
    } else if (by === 'name' && data[0].name !== undefined) {
      result = [...data].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result = data;
    }
    performance.mark('end-sort-operation');
    performance.measure('sort-operation-time', 'start-sort-operation', 'end-sort-operation');
    return result;
  }
  // Proceso completo usando las funciones separadas
  /*async processJson(file: File, filter: string, sortBy: 'id' | 'name' = 'id'): Promise<any[]> {
    let data = await this.parseFile(file);
    data = this.filterData(data, filter);
    data = this.sortData(data, sortBy);
    return data;
  }*/
}