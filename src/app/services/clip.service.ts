import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot} from '@angular/fire/compat/firestore';
import IClip from '../models/clip.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { switchMap, map} from 'rxjs/operators';
import { of, BehaviorSubject, combineLatest } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { __values } from 'tslib';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

 
@Injectable({
  providedIn: 'root'
})
export class ClipService implements Resolve<IClip | null> {
  public clipsCollectoin: AngularFirestoreCollection<IClip>
  pagesClips: IClip[] = []
  pendingReq = false

  constructor(
    private db: AngularFirestore, 
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) { 
    this.clipsCollectoin = db.collection('clips')
  }

   createClip(data: IClip) : Promise<DocumentReference<IClip>>{
    //the add function will create an ID
   return  this.clipsCollectoin.add(data)
  }

  getUserClips(sort$: BehaviorSubject<string>){
    return combineLatest([this.auth.user,
     sort$
    ]).pipe(
      switchMap(values => {
        const [user, sort] = values

        if(!user){
          return of([])
        }
        //ref are object which queries can be made on the database
        const query = this.clipsCollectoin.ref.where(
          'uid', '==', user.uid
        ).orderBy(
          'timestamp', 
          sort === '1' ? 'desc' : 'asc'
        )
        return query.get()
      }),
      map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)

    )}

    updateClip(id: string, title: string){
      //doc object helps to select collection by ID
     return this.clipsCollectoin.doc(id).update({
        title 
      })
    }

    async deleteClip(clip: IClip){
        const clipRef = this.storage.ref(`clips/${clip.fileName}`)
        const screenshotRef = this.storage.ref(
          `screenshots/${clip.screenshotFileName}`
        )

        await clipRef.delete()
       await screenshotRef.delete()
        await  this.clipsCollectoin.doc(clip.docID).delete()
    }

    async getClips(){
      if(this.pendingReq){
        return
      }
      this.pendingReq = true
      let query = this.clipsCollectoin.ref.orderBy(
        'timestamp','desc'
        ).limit(12)

        const { length } = this.pagesClips

        if(length){
          const lastDocID = this.pagesClips[length - 1].docID
          const lastDoc = await this.clipsCollectoin.doc(lastDocID)
          .get()
          .toPromise()

          query = query.startAfter(lastDoc)
        }

        const snapshot = await query.get()
        snapshot.forEach(doc => {
          this.pagesClips.push({
            docID: doc.id,
            ...doc.data()
          })
        })
        this.pendingReq = false
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
      return this.clipsCollectoin.doc(route.params.id)
      .get()
      .pipe(
        map(snapshot => {
          const data = snapshot.data()
          if(!data){
            this.router.navigate(['/'])
            return null
          }
          return data
        })
      )

    }
}
