export default class Utils {
  public static cursorColors = ['red', 'green', 'blue'];

  public static getRandomFromArray(data: Array<any>): any {
    const idx = Math.floor(Math.random() * data.length);
    return data[idx];
  }
}

// define a custom decorator function
export const MeasureTime = (data?: string) => {
  // return a method decorator
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    // get the original method
    const originalMethod = descriptor.value;

    // redefine the descriptor value
    descriptor.value = async function (...args: any[]) {
      // start the timer with a label
      console.time(data || key);

      // call the original method and get the result
      const result = await originalMethod.apply(this, args);

      // end the timer with the same label
      console.timeEnd(data || key);

      // return the result
      return result;
    };
  };
};
