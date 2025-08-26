export class Counter {
    constructor() {
        this.count = $state(0);
        this.increment = () => {
            this.count++;
        };
        this.decrement = () => {
            this.count--;
        };
    }
}
