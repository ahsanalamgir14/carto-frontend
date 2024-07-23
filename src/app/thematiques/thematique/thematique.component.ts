import { MediaMatcher } from '@angular/cdk/layout';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormArray,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { Category } from '../category';
import { Thematique } from '../thematique';
import { ThematiqueService } from '../thematique.service';
import { StorageService } from 'src/app/core/storage/storage.service';

@Component({
  selector: 'app-thematique',
  templateUrl: './thematique.component.html',
})
export class ThematiqueComponent implements OnInit {
  private _mobileQueryListener: () => void;
  @Input() thematique!: Thematique;
  @Input() selected = false;
  @Input() forceSelected = false;
  @Input() categoriesSelected = false;
  @Input() lite = false;
  @Output() categoriesSelection: EventEmitter<Category[]> = new EventEmitter<
    Category[]
  >();
  mobileQuery: MediaQueryList;
  form: FormGroup;
  showCategories: boolean = false;
  categories: Category[] = [];
  loading: boolean = false;
  logoSize: number = 36;
  language: string | null = 'fr';

  constructor(
    private formBuilder: FormBuilder,
    private i18n: TranslateService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private thematiqueService: ThematiqueService,
    private storage: StorageService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    this.form = this.formBuilder.group({
      categories: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    if (!this.mobileQuery.matches && (this.lite || this.forceSelected)) {
      this.logoSize = 64;
    }
    this.language = this.storage.getItem('language');
  }

  toggleCategories(): void {
    this.showCategories = !this.showCategories;

    if (this.showCategories && !this.categories.length) {
      this.getCategories();
    }

    if (!this.showCategories) {
      this.categoriesSelection.emit(this.getSelectedCategories());
    }
  }

  getCategories(emit: boolean = false): void {
    this.loading = true;
    this.thematiqueService
      .get(this.thematique.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (thematique: Thematique | null) => {
          if (thematique) {
            this.categories = thematique.categories;
          }
          this.initializeForm();
          if (emit) {
            this.categoriesSelection.emit(this.getSelectedCategories());
          }
        },
      });
  }

  getCdkConnectedOverlayPanelClasses(): string[] {
    if (this.mobileQuery.matches) {
      return ['fixed', '!top-0', '!bottom-0', '!left-0', '!right-0'];
    }

    return ['max-h-72', '-translate-y-8'];
  }

  getSelectedCategories(): Category[] {
    const selectedCategories: Category[] = [];

    const categoriesFormControl = this.form.get('categories') as FormArray;
    categoriesFormControl.controls.forEach(
      (control: AbstractControl, index: number) => {
        if (control.value) {
          selectedCategories.push(this.categories[index]);
        }
      }
    );

    return selectedCategories;
  }

  getSelectPlaceholder(): string {
    const selectedCategories: Category[] = this.getSelectedCategories();
    if (this.forceSelected && selectedCategories.length === 0) {
      return this.i18n.instant('text.all_goal_categories', {
        number: this.thematique.id,
      });
    }

    if (!this.allSelected()) {
      const selectedTexts: string[] = [];
      selectedCategories.forEach((category: Category) => {
        selectedTexts.push(
          this.i18n.instant('text.target', { target: category.category_number })
        );
      });

      return selectedTexts.join(', ');
    }

    return this.i18n.instant('text.all_goal_categories', {
      number: this.thematique.id,
    });
  }

  allSelected(): boolean {
    return this.form.get('categories')?.value.every((value: boolean) => value);
  }

  initializeForm(): void {
    const checkboxArray: FormArray = this.form.get('categories') as FormArray;
    checkboxArray.clear();
    this.categories.forEach((category: Category) => {
      checkboxArray.push(new FormControl(true));
    });
  }

  onSelectAll(event: any): void {
    const categoriesFormControl = this.form.get('categories') as FormArray;
    const value = event.target?.checked || false;

    categoriesFormControl.controls.forEach((control: AbstractControl) => {
      control.setValue(value);
    });
  }

  onCheckboxChange(event: any, position: number): void {
    const categoriesFormControl = this.form.get('categories') as FormArray;
    categoriesFormControl.controls.forEach(
      (control: AbstractControl, index: number) => {
        if (position === index) {
          control.setValue(control.value);
        }
      }
    );
  }

  onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.toggleCategories();
    }
  }

  onSelected(): void {
    if (this.forceSelected && this.categories.length > 0) {
      this.categories = [];
      this.categoriesSelection.emit(this.categories);
      return;
    }

    if (!this.categories.length) {
      this.getCategories(true);
    }
  }
}
