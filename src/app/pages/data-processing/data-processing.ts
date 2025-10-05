// Importa módulos necesarios para el componente
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
  originalData: any[] = []; // Datos originales
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
    if (!this.file) return alert('Seleccione un archivo');
    // Número de hilos (solo main thread)
    const threadCount = 1;
    performance.mark('start-read-no-worker-parse');
    const mainThreadStart = performance.now();

    this.zone.run(() => {
      this.loading = true;
      this.cdr.detectChanges();
    });

    this.loading = true;
    let text = '';
    let mainThreadTime = 0;
    let parseTime = 0, filterTime = 0, sortTime = 0;
    try {
      //text = await this.file.text();
      performance.mark('end-read-no-worker-parse');
      performance.measure('file-read-no-worker-parse', 'start-read-no-worker-parse', 'end-read-no-worker-parse');
      //const mainThreadBeforeProcessing = performance.now();
      //performance.mark('start-no-worker-processing-parse');
      
      // Procesamiento completo en main thread
      performance.mark('start-parse-no-worker');
      const processedData = await this.datasetService.parseFile(this.file);
      performance.mark('end-parse-no-worker');
      performance.measure('json-parse-no-worker', 'start-parse-no-worker', 'end-parse-no-worker');
      
      //performance.mark('end-no-worker-processing-parse');
      //performance.measure('no-worker-processing-parse', 'start-no-worker-processing-parse', 'end-no-worker-processing-parse');
      
      const mainThreadAfterProcessing = performance.now();
      parseTime = performance.getEntriesByName('json-parse-no-worker')[0]?.duration || 0;
      mainThreadTime = mainThreadAfterProcessing - mainThreadStart;

      this.zone.run(() => {
        this.data = processedData;
        this.loading = false;
        this.cdr.detectChanges();
      });

    } catch (error) {
      console.error(error);
      this.zone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    } finally {
      this.loading = false;
      const readTime = performance.getEntriesByName('file-read-no-worker-parse')[0]?.duration || 0;
      const processingTime = performance.getEntriesByName('no-worker-processing-parse')[0]?.duration || 0;
      const totalTime = readTime + parseTime;
      // El tiempo de bloqueo estimado es todo el procesamiento en main thread
      const estimatedBlockingTime = mainThreadTime;
      console.log('--- KPIs SIN WORKER --- PROCESAR');
      console.log('Hilos utilizados:', threadCount);
      console.log('Lectura:', readTime + ' ms');
      console.log('Procesamiento en hilo principal:', mainThreadTime + ' ms');
      //console.log('  - Parse JSON:', parseTime + ' ms');
      console.log('Tiempo estimado de bloqueo de página:', estimatedBlockingTime + ' ms');
      console.log('Total procesamiento:', totalTime + ' ms');
      console.log('Registros procesados:', this.data.length);
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

    // Número de hilos (solo main thread)
    const threadCount = 1;
    const mainThreadStart = performance.now();
    performance.mark('start-no-worker-processing-filter');

    this.loading = true;
    let mainThreadTime = 0;
    let filterTime = 0, sortTime = 0;
    try {
      performance.mark('start-filter-no-worker');
      const filteredData = await this.datasetService.filterData(this.originalData, this.filter);
      performance.mark('end-filter-no-worker');
      performance.measure('data-filter-no-worker', 'start-filter-no-worker', 'end-filter-no-worker');

      //performance.mark('start-sort-no-worker');
      //this.data = this.datasetService.sortData(filteredData, 'id');
      //performance.mark('end-sort-no-worker');
      //performance.measure('data-sort-no-worker', 'start-sort-no-worker', 'end-sort-no-worker');

      performance.mark('end-no-worker-processing-filter');
      performance.measure('no-worker-processing-filter', 'start-no-worker-processing-filter', 'end-no-worker-processing-filter');
      
      const mainThreadAfterProcessing = performance.now();
      filterTime = performance.getEntriesByName('data-filter-no-worker')[0]?.duration || 0;
      //sortTime = performance.getEntriesByName('data-sort-no-worker')[0]?.duration || 0;
      mainThreadTime = mainThreadAfterProcessing - mainThreadStart;

      this.zone.run(() => {
        this.data = filteredData
        this.loading = false;
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error(error);
      this.loading = false;
    } finally {
      const processingTime = performance.getEntriesByName('no-worker-processing-filter')[0]?.duration || 0;
      const totalTime = processingTime;
      const estimatedBlockingTime = mainThreadTime;
      console.log('--- KPIs SIN WORKER --- FILTRAR');
      console.log('Hilos utilizados:', threadCount);
      console.log('Lectura:', 0 + ' ms');
      console.log('Procesamiento en hilo principal:', processingTime + ' ms');
      console.log('  - Filtrado:', filterTime + ' ms');
      //console.log('  - Ordenamiento:', sortTime + ' ms');
      console.log('Tiempo estimado de bloqueo de página:', estimatedBlockingTime + ' ms');
      console.log('Total procesamiento:', totalTime + ' ms');
      console.log('Registros procesados:', this.data.length);
    }
  }

  async ordenar() {
    if (!this.data || this.data.length === 0) {
      return alert('No hay datos para ordenar. Primero procese un archivo.');
    }

    // Número de hilos (solo main thread)
    const threadCount = 1;
    const mainThreadStart = performance.now();
    performance.mark('start-no-worker-processing-sort');

    this.loading = true;
    let mainThreadTime = 0;
    let sortTime = 0;
    try {
      performance.mark('start-sort-no-worker');
      const sortedData = await this.datasetService.sortData(this.data);
      performance.mark('end-sort-no-worker');
      performance.measure('data-sort-no-worker', 'start-sort-no-worker', 'end-sort-no-worker');

      performance.mark('end-no-worker-processing-sort');
      performance.measure('no-worker-processing-sort', 'start-no-worker-processing-sort', 'end-no-worker-processing-sort');
      
      const mainThreadAfterProcessing = performance.now();
      sortTime = performance.getEntriesByName('data-sort-no-worker')[0]?.duration || 0;
      mainThreadTime = mainThreadAfterProcessing - mainThreadStart;

      this.zone.run(() => {
        this.data = sortedData
        this.loading = false;
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error(error);
      this.loading = false;
    } finally {
      const processingTime = performance.getEntriesByName('no-worker-processing-sort')[0]?.duration || 0;
      const totalTime = processingTime;
      const estimatedBlockingTime = mainThreadTime;
      console.log('--- KPIs SIN WORKER --- ORDENAR');
      console.log('Hilos utilizados:', threadCount);
      console.log('Lectura:', 0 + ' ms');
      console.log('Procesamiento en hilo principal:', processingTime + ' ms');
      console.log('  - Ordenamiento:', sortTime + ' ms');
      console.log('Tiempo estimado de bloqueo de página:', estimatedBlockingTime + ' ms');
      console.log('Total procesamiento:', totalTime + ' ms');
      console.log('Registros procesados:', this.data.length);
    }
  }
}
