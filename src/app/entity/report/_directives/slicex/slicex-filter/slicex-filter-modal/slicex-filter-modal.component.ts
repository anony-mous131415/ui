import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-slicex-filter-modal',
  templateUrl: './slicex-filter-modal.component.html',
  styleUrls: ['./slicex-filter-modal.component.scss']
})
export class SlicexFilterModalComponent implements OnInit {

  filteredList: any[] = [];

  constructor(
    private modalRef: MatDialogRef<SlicexFilterModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit() {
    // console.log('MODAL-INIT ', this.data);
  }

  onNoClick() {
    this.modalRef.close(null);
  }

  onApplyClick() {
    this.modalRef.close({ remainingList: this.data, removedList: this.filteredList });
  }

  removeFilter(inpEntity: string, inpID: number) {
    this.filteredList.push({ id: inpID, entity: inpEntity });
    this.data[inpEntity].values = this.data[inpEntity].values.filter(item => (item.id !== inpID));
  }

  clearAllFilters() {
    //this.filteredList = [];
    const list = [];
    Object.keys(this.data).forEach(key => {
      this.data[key].values.forEach(item => {
        !this.isExists(item) ? list.push({ id: item.id, entity: key }) : null;
      });
    });
    this.filteredList.push(...list);
    this.data = {};
  }

  clearAllFiltersEntity(inpEntity: string) {
    const list = [];
    this.data[inpEntity].values.forEach(item => {
      !this.isExists(item) ? list.push({ id: item.id, entity: inpEntity }) : null;
    });
    this.filteredList.push(...list);
    const data = {};
    Object.keys(this.data).forEach(key => {
      if (key !== inpEntity) {
        data[key] = this.data[key];
      }
    });
    this.data = data;
  }

  private isExists(value) {
    const index = this.filteredList.findIndex(item => item.id === value.id && item.entity === value.entity);
    return (index === -1);
  }

  get bc() {
    return this.data;
  }

  get bcEntities() {
    return Object.keys(this.data);
  }

}
