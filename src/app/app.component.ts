import { Component, OnInit } from '@angular/core';
import { FileWatcherService } from './file-watcher.service';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { interval, Subscription } from 'rxjs';
import { TransliterationPipe } from './transliteration.pipe';
import { GoogleTransliterationPipe } from './google-transliteration.pipe';




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule,
    TransliterationPipe,
    GoogleTransliterationPipe
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  Ram = "Shri Ram";
  title = '';
  apiUrl = '';
  dashboardTitle= '';
  brandImagePath= '';
  backgroundImagePath= '';
  deviceIds = ''; // Example Device IDs
  latestImageData: any;
  selectedDevice:any;
  isFullscreen = false;
  isCancelled = false;
  showDropdown:boolean = true;

  private fetchIntervalSubscription: Subscription | null = null;
  

  constructor(
    private fileWatcherService: FileWatcherService, 
    private http: HttpClient
  ) { }


  ngOnInit(): void {
    // Fetch the config.json file from the assets folder
    this.http.get<any>('/assets/frontendConfig.json').subscribe(config => {
      this.apiUrl = config.apiUrl;
      this.fileWatcherService.initialize(this.apiUrl); // Initialize the service
      this.deviceIds = config.deviceID;
      this.title = config.appTitle;
      this.dashboardTitle = config.dashboardTitle;
      this.brandImagePath = config.brandImagePath;
      this.backgroundImagePath = config.backgroundImagePath;
    });

   

  }

  toggleDropdown() {
   this.showDropdown = !this.showDropdown;
  }

  onDeviceSelect(event: any): void {
    const selectedDevice = (event.target as HTMLSelectElement).value;
    this.selectedDevice = selectedDevice;
    console.log('Selected Device:', selectedDevice);

    // Clear any existing interval subscription
    if (this.fetchIntervalSubscription) {
      this.fetchIntervalSubscription.unsubscribe();
    }

    // Start fetching data every 2 seconds for the selected device
    if (selectedDevice !== 'None') {
      // this.fetchLatestImage(selectedDevice);
      this.fetchIntervalSubscription = interval(3000).subscribe(() => {
        this.fetchLatestImage(selectedDevice);
      });
    }
  }

  fetchLatestImage(deviceId: string): void {
    this.fileWatcherService.getLatestImage(deviceId).subscribe(
      (data) => {
        this.latestImageData = data;
        console.log('UI DATA:', data);
      },
      (error) => {
        console.error('Error fetching image:', error);
      }
    );

    //Listein for Real Time Updates
    this.fileWatcherService.onFileAdded((data) => {
      // console.log("---------------Device Popped:--------------", data.deviceId)
      if (data.deviceId === this.selectedDevice) {
        this.latestImageData = data;
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from the interval to prevent memory leaks
    if (this.fetchIntervalSubscription) {
      this.fetchIntervalSubscription.unsubscribe();
    }
  }

  enterFullscreen(): void {
    this.isFullscreen = true;
    this.isCancelled = false;
    document.documentElement.requestFullscreen();
  }

  exitFullscreen(): void {
    this.isFullscreen = false;
    this.isCancelled = false;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  cancelFullscreen(): void {
    this.isFullscreen = false;
    this.isCancelled = true;
    this.latestImageData= '';
    this.selectedDevice = 'None';
    if (document.fullscreenElement) {
      document.exitFullscreen();
    };
  }


   
}
  
