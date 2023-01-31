import { ValidationErrors, AbstractControl, ValidatorFn } from "@angular/forms";

export class RegisterValidators {

    static match(cotroleName: string, matchingControlName: string): ValidatorFn{
        return (group: AbstractControl): ValidationErrors | null => {
            const control = group.get(cotroleName)
            const matchingControl = group.get(matchingControlName)

            if (!control || !matchingControl) {
                console.error('Form controls can not be found in the form group.')
                return { controlNotFound: false }
            }
            const error = control.value === matchingControl.value ?
                null :
                {
                    noMatch: true
                }
                matchingControl.setErrors(error)
            return error
        }
    }
}
//statis method propterties do not have access outside its method. Do not have acces to "this" key word
//new RegisterValidators.match() <~ Without static 
// RegisterValidators.match() <~ WIth static