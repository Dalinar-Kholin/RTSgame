
export interface ICharactersUtils{
    health: number
    moveUnit(x: number, y: number, callback?: ()=>void): void
    attackUnit(x: number, y: number, callback?: ()=>void): void
    takeDamage(damage: number): boolean
    takeStatAttack(): number
    takeRange(): number
    takeStatHealth(): number
}