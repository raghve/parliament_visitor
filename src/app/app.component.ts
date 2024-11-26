import { Component, OnInit } from '@angular/core';
import { FileWatcherService } from './file-watcher.service';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'visitor_Display';
  deviceIds = ['None', 'D001', 'D002', 'D003', 'D004']; // Example Device IDs
  latestImageData: any;
  selectedDevice:any;

  isFullscreen = false;
  isCancelled = false;
  

  constructor(private fileWatcherService: FileWatcherService) {}

  ngOnInit(): void {}

  onDeviceSelect(event: any): void {
    const selectedDevice = (event.target as HTMLSelectElement).value;
    this.selectedDevice = selectedDevice;
    console.log('Selected Device:', selectedDevice);
    const deviceId = event.target.value;

    // Get the latest image when the device is selected
    this.fileWatcherService.getLatestImage(deviceId).subscribe(
      (data) => {
        this.latestImageData = data;
        // console.log('UI DATA',data);
      },
      (error) => {
        console.error('Error fetching image:', error);
      }
    );

    // Listen for real-time updates when a new file is added
    this.fileWatcherService.onFileAdded((data) => {
      // console.log('New file added UI:', data);
      // Only update the UI if the image belongs to the selected device
      
      if (data.deviceId === this.selectedDevice) {
        this.latestImageData = data;
        // console.log('UI updated with new file data:', data);
      }
      
    });
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
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    this.latestImageData= '';
  }


   
}
  
