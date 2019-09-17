export class DNDMode {
  activated: boolean;
  startHour: number;
  endHour: number;

  constructor(activated = false, startHour = 20, endHour = 12) {
    this.activated = activated;
    this.startHour = startHour;
    this.endHour = endHour;
  }

  check(): boolean {
    const currentHour = new Date().getHours();

    if (!this.activated) {
      return false;
    }

    if (this.startHour > this.endHour) {
      return currentHour > this.startHour || currentHour < this.endHour;
    } else {
      return currentHour > this.startHour && currentHour < this.endHour;
    }

  }
}
