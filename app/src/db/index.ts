interface Repository {
    build: Function;
    create: Function;
    get: Function;
}

interface RepositoryConstructable {
    new (db:IDBDatabase): Repository
}

export const initiateDb = (name: string, repositories: Array<RepositoryConstructable>): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        // ! use version 0 for initial build and testing only, it is intended to clear and build from 0
        const version = 0;
    
        indexedDB.deleteDatabase(name)
        const request: IDBOpenDBRequest = indexedDB.open(name, version);
    
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
            repositories.forEach((repoClass: RepositoryConstructable) => {
                const repo = new repoClass(db);

                repo.build(version);
            });
        });
    
    });
      
}

declare type SolarAccess = {
    reference: string;
    key: string;
}

export class SolarAccessRepository {
    #db: IDBDatabase;
    #storeName: string = 'solar-access';

    constructor(db: IDBDatabase) {
        this.#db = db;
    }

    build(version: number) {
        const clearStorage = () => {
            if(this.#db.objectStoreNames.contains(this.#storeName)) {
                this.#db.deleteObjectStore(this.#storeName);
            }
        }

        if(version === 0) {
            clearStorage();
        }

        if(version <= 1) {
            this.#db.createObjectStore(this.#storeName, { keyPath: "reference" });
        }
    } 

    create(value: SolarAccess): Promise<IDBValidKey> {

        return new Promise((resolve, reject) => {

            // open a read/write db transaction, ready for adding the data
            const transaction = this.#db.transaction(this.#storeName, "readwrite");
            
            // create an object store on the transaction
            const objectStore = transaction.objectStore(this.#storeName);

            // Make a request to add our newItem object to the object store
            const request = objectStore.add(value);

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