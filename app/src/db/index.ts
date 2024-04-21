export const initiateDb = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
    
        const request: IDBOpenDBRequest = indexedDB.open('SolarPowerStats', 1);
    
        request.addEventListener('success', () => {
            resolve(request.result);
        });
    
        request.addEventListener('error', () => {
            console.error(request.error);
            reject(request.error);
        });
    
        request.addEventListener('upgradeneeded', () => {
            const db: IDBDatabase = request.result;

            // Create an objectStore to hold solar stats.
            // const objectStore = db.createObjectStore("solarStats", { keyPath: "id" });
            const objectStore = db.createObjectStore("solar-access", { keyPath: "reference" });

            // Each data field that is not used as key, requires an index
            objectStore.createIndex("key", "key");

        });
    
    });
      
}

declare type SolarAccess = {
    reference: string;
    key: string;
}

export class SolarAccessRepository {
    #db: IDBDatabase;
    #storeName: string;

    constructor(db: IDBDatabase, storeName: string) {
        this.#db = db;
        this.#storeName = storeName;
    }

    create(value: SolarAccess): Promise<IDBValidKey> {

        return new Promise((resolve, reject) => {

            // open a read/write db transaction, ready for adding the data
            const transaction = this.#db.transaction(this.#storeName, "readwrite");
            
            // create an object store on the transaction
            const objectStore = transaction.objectStore(this.#storeName);

            // Make a request to add our newItem object to the object store
            const request = objectStore.add(value, value.reference);

            // report on the success of the transaction completing, when everything is done
            transaction.addEventListener('complete', () => {
                resolve(request.result);
            });
            
            transaction.addEventListener("error", () => {
                console.error(transaction.error);
                reject(transaction.error);
            });
        })
    }

    get(reference: string): Promise<SolarAccess> {

        return new Promise((resolve, reject) => {

            // open a read db transaction
            const transaction = this.#db.transaction(this.#storeName, "readonly");
            
            // create an object store on the transaction
            const objectStore = transaction.objectStore(this.#storeName);
            
            // Make a request to fetch the object from the object store
            const request = objectStore.get(reference);

            // report on the success of the transaction completing, when everything is done
            transaction.addEventListener('complete', () => {
                resolve(request.result);
            });
            
            transaction.addEventListener('error', () => {
                console.error(transaction.error);
                reject(transaction.error);
            });
            
        })
    }
}