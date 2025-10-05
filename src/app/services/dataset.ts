import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Hace que el servicio esté disponible en toda la app
})
export class Dataset {
  // Parsea el archivo a un array de objetos
  async parseFile(file: File): Promise<any[]> {
    const text = await file.text();
    let data = JSON.parse(text);
    if (!Array.isArray(data)) {
      data = Object.values(data);
    }
    return data;
  }
  // Filtra los datos por texto
  async filterData(data: any[], filter: string): Promise<any[]> {
    if (!filter) return [...data];
    const f = filter.toLowerCase();
    return data.filter(item => JSON.stringify(item).toLowerCase().includes(f));
  }
  // Ordena los datos por el campo 'id' (numérico) o 'name' (alfabético)
  async sortData(data: any[], by: 'id' | 'name' = 'id'): Promise<any[]> {
    if (!data.length) return data;
    if (by === 'id' && data[0].id !== undefined) {
      return [...data].sort((a, b) => a.id - b.id);
    }
    if (by === 'name' && data[0].name !== undefined) {
      return [...data].sort((a, b) => a.name.localeCompare(b.name));
    }
    return data;
  }
  // Proceso completo usando las funciones separadas
  /*async processJson(file: File, filter: string, sortBy: 'id' | 'name' = 'id'): Promise<any[]> {
    let data = await this.parseFile(file);
    data = this.filterData(data, filter);
    data = this.sortData(data, sortBy);
    return data;
  }*/
}