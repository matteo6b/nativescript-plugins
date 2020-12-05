import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { NativescriptImageCacheItComponent } from './nativescript-image-cache-it.component';

@NgModule({
	imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: NativescriptImageCacheItComponent }])],
	declarations: [NativescriptImageCacheItComponent],
	schemas: [NO_ERRORS_SCHEMA],
})
export class NativescriptImageCacheItModule {}
