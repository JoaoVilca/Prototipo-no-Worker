import { CommonModule } from '@angular/common';
import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dataset } from '../../services/dataset';

@Component({
  selector: 'app-data-processing', // Selector del componente
  imports: [CommonModule, FormsModule], // Módulos importados
  templateUrl: './data-processing.html', // Plantilla HTML
  styleUrl: './data-processing.scss', // Estilos
  standalone: true
})
export class DataProcessing {
  file?: File; // Archivo seleccionado
  filter: string = ''; // Filtro de búsqueda
  data: any[] = []; // Datos filtrados
  originalData: any[] = []; // Datoss originales
  loading: boolean = false; // Estado de carga

  constructor(
    private datasetService: Dataset,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  // Maneja la selección de archivo
  onFileSelected(event: any) {
    this.file = event.target.files[0];
  }

  // Procesa el archivo y muestra todos los resultados ordenados
  async process() {
    // Limpiar mediciones anteriores
    performance.clearMarks();
    performance.clearMeasures();
    
    performance.mark('start-total-process');
    if (!this.file) return alert('Seleccione un archivo');
    
    // Número de hilos (solo main thread)
    const threadCount = 1;
    const mainThreadStart = performance.now();

    this.zone.run(() => {
      this.loading = true;
      this.cdr.detectChanges();
    });

    this.loading = true;
    let mainThreadBlockingTime = 0;
    let totalTime = 0;
    
    try {
      // Medir tiempo total de parseFile (incluye lectura + parsing)
      performance.mark('start-parse-file');
      const processedData = await this.datasetService.parseFile(this.file);
      performance.mark('end-parse-file');
      performance.measure('total-parse-file', 'start-parse-file', 'end-parse-file');

      const mainThreadAfterProcessing = performance.now();
      mainThreadBlockingTime = mainThreadAfterProcessing - mainThreadStart;
      totalTime = performance.getEntriesByName('total-parse-file')[0]?.duration || 0;

      this.zone.run(() => {
        this.data = processedData;
        this.originalData = [...processedData]; // Guardar copia para filtrado
        this.loading = false;
        this.cdr.detectChanges();
      });
      
      performance.mark('end-total-process');
      performance.measure('total-process-time', 'start-total-process', 'end-total-process');

    } catch (error) {
      console.error(error);
      this.zone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    } finally {
      this.loading = false;
      
      // Obtener mediciones finales
      const finalTotalTime = performance.getEntriesByName('total-process-time')[0]?.duration || 0;
      const fileReadTime = performance.getEntriesByName('file-read-time')[0]?.duration || 0;
      const jsonParseTime = performance.getEntriesByName('json-parse-time')[0]?.duration || 0;
      
      console.log('--- KPIs SIN WORKER --- PROCESAR');
      console.log('Hilos utilizados:', threadCount);
      console.log('Tiempo total de procesamiento:', finalTotalTime + ' ms');
      console.log('Tiempo de lectura de archivo:', fileReadTime + ' ms');
      console.log('Tiempo de parsing JSON:', jsonParseTime + ' ms');
      console.log('Tiempo de bloqueo del hilo principal:', mainThreadBlockingTime + ' ms');
      console.log('Registros procesados:', this.data.length);
      
      // Log adicional para debugging
      console.log('--- Performance Entries ---');
      performance.getEntriesByType('measure').forEach(entry => {
        console.log(`${entry.name}: ${entry.duration.toFixed(2)} ms`);
      });
    }
  }

  // Aplica el filtro solo cuando el usuario lo solicita
  async filtrar() {
    if (!this.originalData || this.originalData.length === 0) {
      return alert('No hay datos para filtrar. Primero procese un archivo.');
    }

    if (!this.filter || this.filter.trim().length === 0) {
      return alert('Ingrese un texto de filtro.');
    }

    // Limpiar mediciones anteriores
    performance.clearMarks();
    performance.clearMeasures();
    
    performance.mark('start-total-filter');
    // Número de hilos (solo main thread)
    const threadCount = 1;
    const mainThreadStart = performance.now();

    this.loading = true;
    let mainThreadBlockingTime = 0;
    
    try {
      performance.mark('start-filter-operation');
      const filteredData = await this.datasetService.filterData(this.originalData, this.filter);
      performance.mark('end-filter-operation');
      performance.measure('total-filter-operation', 'start-filter-operation', 'end-filter-operation');

      const mainThreadAfterProcessing = performance.now();
      mainThreadBlockingTime = mainThreadAfterProcessing - mainThreadStart;

      this.zone.run(() => {
        this.data = filteredData;
        this.loading = false;
        this.cdr.detectChanges();
      });
      
      performance.mark('end-total-filter');
      performance.measure('total-filter-time', 'start-total-filter', 'end-total-filter');
      
    } catch (error) {
      console.error(error);
      this.loading = false;
    } finally {
      const totalFilterTime = performance.getEntriesByName('total-filter-time')[0]?.duration || 0;
      const filterOpTime = performance.getEntriesByName('filter-operation-time')[0]?.duration || 0;
      
      console.log('--- KPIs SIN WORKER --- FILTRAR');
      console.log('Hilos utilizados:', threadCount);
      console.log('Tiempo total de filtrado:', totalFilterTime + ' ms');
      console.log('Tiempo de operación de filtrado:', filterOpTime + ' ms');
      console.log('Tiempo de bloqueo del hilo principal:', mainThreadBlockingTime + ' ms');
      console.log('Registros procesados:', this.data.length);
      
      // Log adicional para debugging
      console.log('--- Performance Entries ---');
      performance.getEntriesByType('measure').forEach(entry => {
        console.log(`${entry.name}: ${entry.duration.toFixed(2)} ms`);
      });
    }
  }

  async ordenar() {
    if (!this.data || this.data.length === 0) {
      return alert('No hay datos para ordenar. Primero procese un archivo.');
    }

    // Limpiar mediciones anteriores
    performance.clearMarks();
    performance.clearMeasures();
    
    performance.mark('start-total-sort');
    // Número de hilos (solo main thread)
    const threadCount = 1;
    const mainThreadStart = performance.now();

    this.loading = true;
    let mainThreadBlockingTime = 0;
    
    try {
      performance.mark('start-sort-operation');
      const sortedData = await this.datasetService.sortData(this.data);
      performance.mark('end-sort-operation');
      performance.measure('total-sort-operation', 'start-sort-operation', 'end-sort-operation');

      const mainThreadAfterProcessing = performance.now();
      mainThreadBlockingTime = mainThreadAfterProcessing - mainThreadStart;

      this.zone.run(() => {
        this.data = sortedData;
        this.loading = false;
        this.cdr.detectChanges();
      });
      
      performance.mark('end-total-sort');
      performance.measure('total-sort-time', 'start-total-sort', 'end-total-sort');
      
    } catch (error) {
      console.error(error);
      this.loading = false;
    } finally {
      const totalSortTime = performance.getEntriesByName('total-sort-time')[0]?.duration || 0;
      const sortOpTime = performance.getEntriesByName('sort-operation-time')[0]?.duration || 0;
      
      console.log('--- KPIs SIN WORKER --- ORDENAR');
      console.log('Hilos utilizados:', threadCount);
      console.log('Tiempo total de ordenamiento:', totalSortTime + ' ms');
      console.log('Tiempo de operación de ordenamiento:', sortOpTime + ' ms');
      console.log('Tiempo de bloqueo del hilo principal:', mainThreadBlockingTime + ' ms');
      console.log('Registros procesados:', this.data.length);
      
      // Log adicional para debugging
      console.log('--- Performance Entries ---');
      performance.getEntriesByType('measure').forEach(entry => {
        console.log(`${entry.name}: ${entry.duration.toFixed(2)} ms`);
      });
    }
  }
}
