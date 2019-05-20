class Vehicle implements IVehicle {
    constructor(public color: string) {
    }
    start(type: string) {
        return 'the ' + this.color + ' ' + type + ' started';
    }
}
interface IVehicle {
    start(type: string): string;
}
class Car extends Vehicle {
    constructor(color: string) {
        super(color);
    }
    start() {
        return super.start('car');
    }
}
interface ITrunk {
    openTrunk(): void
}
interface IWindow {
    openWindow(): void
}
class Sedan extends Car implements ITrunk, IWindow {
    constructor(color: string) {
        super(color);
    }
    start() {
        return super.start() + ' and it is a Sedan';
    }
    openTrunk() {
        console.log('Trunk is open');
    }
    openWindow() {
        console.log('Window is open');
    }
}
class Truck extends Vehicle {
    constructor(color: string) {
        super(color);
    }
    start() {
        return super.start('truck');
    }
}
var car = new Car('green');

var sedan = new Sedan('red');
sedan.openTrunk();
sedan.openWindow();

var truck = new Truck('blue');