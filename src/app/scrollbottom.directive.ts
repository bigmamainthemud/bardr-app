import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[appScrollBottom]',
  standalone: true
})
export class ScrollBottomDirective implements OnChanges {
  @Input() appScrollBottom?: boolean;

  constructor(private el: ElementRef) {}

  ngOnChanges() {
    if (this.appScrollBottom) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    const element = this.el.nativeElement;
    setTimeout(() => {
      element.scrollTop = element.scrollHeight;
    }, 0);
  }
}
