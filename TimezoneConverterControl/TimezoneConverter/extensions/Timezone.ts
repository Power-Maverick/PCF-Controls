export class Timezone  {
    constructor(id: string, text: string) {
        this.tz = id;
        this.displayName = text;
    }
    
    tz: string;
    displayName: string;
}