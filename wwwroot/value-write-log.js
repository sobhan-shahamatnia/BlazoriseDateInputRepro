// Logs every programmatic write to the value of an <input type="date"> that has an id,
// so the server-side write-back that resets the browser's segment typing becomes visible.
(() => {
    const descriptor = Object.getOwnPropertyDescriptor( HTMLInputElement.prototype, "value" );

    Object.defineProperty( HTMLInputElement.prototype, "value", {
        get() {
            return descriptor.get.call( this );
        },
        set( value ) {
            if ( this.type === "date" && this.id ) {
                const log = document.getElementById( "value-write-log" );

                if ( log ) {
                    const time = new Date().toISOString().substring( 11, 23 );
                    log.textContent += `${time}  #${this.id}.value = ${JSON.stringify( value )}\n`;
                }
            }

            descriptor.set.call( this, value );
        }
    } );
})();
