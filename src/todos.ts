import * as DB from 'worktop/kv';
import { ulid } from 'worktop/utils';
import type { ULID } from 'worktop/utils';
import type { KV } from 'worktop/kv';


export default function globals(env){

const kv = env.kv
const toPrefix = (completed: boolean) => `todo::${completed}::`;
const toKeyname = (completed: boolean, createdAt: number) => toPrefix(completed) + createdAt;

 async function list(completed?: boolean, options: { limit?: number; page?: number } = {limit: 1000}): Promise<string[]> {
	const prefix = toPrefix(completed);
	const keys = await DB.paginate<string[]>(kv, { ...options, prefix: typeof completed != 'undefined'? prefix: '' });
	//    ^keys are the full KV key names
	// Remove the `prefix::` from each of them
	 
	return Promise.all(keys.map(x => x.substring(6)).map(async x=>{
		const keys = x.split('::')
		return {completed: keys[0] == 'true', ...(await find(keys[1])), createdAt: keys[1]*1}
	  }))
}

 function save({createdAt, completed, val}) {
	const key = toKeyname(completed, createdAt);
	return DB.write(kv, key, {val});
}

 async function find(createdAt) {
	const key = toKeyname(true, createdAt);
	const key2 = toKeyname(false, createdAt)
	const res1 = await DB.read(kv, key, 'json')
	return res1? res1 : DB.read(kv, key2, 'json')
}


 async function insert(item) {
		if (await save({completed: false, ...item})) {
            return true
        } else {
            throw new Error('no insert completed' + JSON.stringify(item))
        }

}

//no update operation as it is redundant
//but this is how it's done https://github.com/lukeed/worktop/blob/master/examples/workers/kv-todos/model.ts

/**
 * Remove an existing `completed` record
 * - Synchronizes owner's ID list for `GET /todos` route
 */
 function destroy({createdAt, completed}) {
	const key = toKeyname(completed, createdAt);
	return DB.remove(kv, key);
}

function transform(item){
	
}

return {destroy, save, insert, find, list}
}
