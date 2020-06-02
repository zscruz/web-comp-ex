class DbMeter extends HTMLElement {
    private _root: ShadowRoot;
    private _value: number;

    private readonly firstMark = 1;
    private readonly largeMark = 11;
    private readonly lastMark = 18;

    private readonly minScaleValue = 30;
    private readonly midScaleValue = 80;
    private readonly maxScaleValue = 120;
    private readonly colors = ['#3b3838', '#2bff67', '#ebdb34']

    public get value(): number {
        return this._value;
    }

    public set value(newValue: number) {
        if (this._value === newValue) return;
        this._value = newValue;
    }

    constructor() {
        super();

        // Attach a hidden seperate DOM to this element.
        this._root = this.attachShadow({ mode: 'open' });
        this._value = 0;

        this.initializeComponent();
    }

    private initializeComponent() {
        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', 'db-meter.css');
        this._root.appendChild(linkElem);


        const valueElement = document.createElement('div');
        valueElement.setAttribute('class', 'db-meter-value');
        valueElement.innerHTML = `${this._value}`;
        this._root.appendChild(valueElement);

        const unitsElement = document.createElement('div');
        unitsElement.setAttribute('class', 'db-meter-units');
        unitsElement.innerHTML = 'dB';
        this._root.appendChild(unitsElement);

        const marksContainerElement = document.createElement('div');
        marksContainerElement.setAttribute('class', 'db-meter-container');
        this._root.appendChild(marksContainerElement);

        for (let index = this.firstMark; index <= this.lastMark; index++) {
            const markContainerElement = document.createElement('div');
            markContainerElement.setAttribute('class', 'db-meter-mark-container');
            marksContainerElement.appendChild(markContainerElement);

            const markElement = document.createElement('div');
            markElement.setAttribute('class', 'db-meter-scale-mark');
            markContainerElement.appendChild(markElement);

            if (index === this.firstMark || index === this.lastMark || index === this.largeMark) {
                const markValueElement = document.createElement('div');
                markValueElement.setAttribute('class', 'db-meter-scale-mark-value');
                if (index == this.firstMark) {
                    markValueElement.innerHTML = this.minScaleValue.toString();
                    markValueElement.style.marginTop = '8px';
                }
                if (index == this.largeMark) {
                    markValueElement.innerHTML = this.midScaleValue.toString();
                    markElement.setAttribute('class', 'db-meter-scale-mark db-meter-scale-mark-value-large');

                }

                if (index == this.lastMark) {
                    markValueElement.innerHTML = this.maxScaleValue.toString();
                    markValueElement.style.marginTop = '8px';
                }

                markContainerElement.appendChild(markValueElement);

            }
        }
    }

    /**
     * Invoked each time the custom eleement is appended to the DOM.
     */
    public connectedCallback(): void {
        const initalValue = this.getAttribute('value');
        if (initalValue !== null) {
            this._value = Number(initalValue);
        }

        this.render();
    }

    private render(): void {
        const valueElement = this._root.querySelector<HTMLElement>('.db-meter-value');
        if (valueElement != null) {
            valueElement.innerHTML = Number(this._value).toFixed(0);
        }

        this.fillMarkElements();
    }

    private fillMarkElements(): void {
        const numberOfMarks = this.getNumberOfMarksToFill();
        const markElements = this._root.querySelectorAll<HTMLElement>('.db-meter-scale-mark');
        markElements.forEach((element, elementIndex) => {
            if (elementIndex <= numberOfMarks - 1) {
                element.style.backgroundColor = this.getColor();
            }
            else {
                element.style.backgroundColor = this.colors[0];
            }
        });
    }

    private getNumberOfMarksToFill(): number {
        let numberOfMarks = 0;
        if (this._value >= this.minScaleValue) {
            const offsetValue = this._value - this.minScaleValue;
            numberOfMarks = offsetValue / 5 + 1;
        }

        return numberOfMarks;
    }

    private getColor(): string {
        switch (true) {
            case (this._value < this.minScaleValue):
                return this.colors[0];
            case (this._value >= this.minScaleValue && this._value < this.midScaleValue):
                return this.colors[1];
            case (this._value >= this.midScaleValue):
                return this.colors[2];
            default:
                return this.colors[0];

        }
    }

    /**
     * Invoked each time one of the custom eleement's attributes is added, removed, or changed.
     * @param name 
     * @param oldValue 
     * @param newValue 
     */
    public attributeChangedCallback(name: string, oldValue: number, newValue: number): void {
        if (oldValue !== newValue) {
            switch (name) {
                case 'value':
                    if (newValue != null) {
                        this.value = newValue;
                        this.render();
                    }
                    break;
            }
        }
    }

    /**
     * Add all names of attributes that needed to be observed.
     */
    public static get observedAttributes(): string[] {
        return ['value'];
    }
}

customElements.define('ex-db-meter', DbMeter);