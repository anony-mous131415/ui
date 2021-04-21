import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-image-grid-modal',
  templateUrl: './image-grid-modal.component.html',
  styleUrls: ['./image-grid-modal.component.scss']
})
export class ImageGridModalComponent implements OnInit {
  selectedImage: string;
  constructor(
    private modalRef: MatDialogRef<ImageGridModalComponent>,
    @Inject(MAT_DIALOG_DATA) private configData: any,
  ) { }

  ngOnInit() {
  }

  get config() {
    return this.configData;
  }

  onSaveClick() {
    this.modalRef.close(this.selectedImage);
  }

  selectedImagesReceived(event){
    this.selectedImage = event.length > 0 ? event[0].url : null;
  }
}
