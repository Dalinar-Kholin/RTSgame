export default class MessageSent {
    message: string
    type: string = "MessageSent"
    constructor(message: string) {
        this.message = message
    }
}