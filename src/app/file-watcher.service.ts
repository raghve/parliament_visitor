import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class FileWatcherService {
  private apiUrl = 'http://localhost:3000';
  private socket = io('http://localhost:3000'); // Backend socket server URL

  constructor(private http: HttpClient) {}

  // Get the latest image and its data for the selected Device ID
  getLatestImage(deviceId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-latest-image/${deviceId}`).pipe();
  }

  // Listen for new file added to the watched folder

  onFileAdded(callback: (fileData: any) => void): void {
    this.socket.on('file-added', (fileData: any) => {
      callback(fileData);
    });
  }

  // onFileAdded(callback: (fileData: any) => void): void {
  //   this.socket.on('file-added', (filePath: string) => {
  //     this.getFileData(filePath).subscribe(callback);
  //   });
  // }

  // Helper method to extract file data based on file path
  // getFileData(filePath: string): Observable<any> {
  //   // Extract the file name from the full path
  //   const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
    
  //   // Split the file name into components based on the '~' separator
  //   const [enrollId, name, timestamp] = fileName.replace('.jpg', '').split('~');
    
  //   return new Observable((observer) => {
  //     observer.next({
  //       filePath,
  //       enrollId,
  //       name,
  //       timestamp,
  //     });
  //   });
  // }
}
