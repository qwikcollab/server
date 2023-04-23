export default class Utils {
  public static cursorColors = ['red', 'green', 'blue'];

  public static getRandomFromArray(data: Array<any>): any {
    const idx = Math.floor(Math.random() * data.length);
    return data[idx];
  }
}
