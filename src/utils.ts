export enum Langs {
  JS = 'javascript',
  TS = 'typescript',
  PYTHON = 'python',
  PHP = 'php',
  JAVA = 'java',
}

export default class Utils {
  public static cursorColors = [
    'red',
    'green',
    'blue',
    'yellow',
    'purple',
    'pink',
    'teal',
    'cyan',
    'lime',
  ];

  public static getRandomFromArray(data: Array<any>): any {
    const idx = Math.floor(Math.random() * data.length);
    return data[idx];
  }

  public static getLangDefaultCode(lang: string): string {
    switch (lang) {
      case Langs.JS:
        return 'console.log("hello world")';
      case Langs.TS:
        return 'console.log("hello world")';
      case Langs.PYTHON:
        return 'print("hello world")';
      case Langs.PHP:
        return '<?php\n echo "hello world"; \n?>';
      case Langs.JAVA:
        return (
          'class HelloWorld {\n' +
          '  public static void main(String[] args) {\n' +
          '    System.out.println("Hello World!");\n' +
          '  }\n' +
          '}'
        );
      case 'ruby':
        return 'puts "hello world"';
      default:
        return '// Write your code here';
    }
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
