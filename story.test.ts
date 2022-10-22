import { expectTypeOf } from 'expect-type';
import {
  AnyFramework,
  Args,
  ArgsFromMeta,
  ArgsStoryFn,
  ComponentAnnotations,
  DecoratorFunction,
  LoaderFunction,
  ProjectAnnotations,
  StoryAnnotationsOrFn,
} from './story';

// NOTE Example of internal type definition for @storybook/<X> (where X is a framework)
interface XFramework extends AnyFramework {
  component: (args: this['T']) => string;
  storyResult: string;
}

type XMeta<TArgs = Args> = ComponentAnnotations<XFramework, TArgs>;
type XStory<TArgs = Args> = StoryAnnotationsOrFn<XFramework, TArgs>;

// NOTE Examples of using types from @storybook/<X> in real project

type ButtonArgs = {
  x: string;
  y: string;
};

const Button = (props: ButtonArgs) => 'Button';

// NOTE Various kind usages
const simple: XMeta = {
  title: 'simple',
  component: Button,
  decorators: [(storyFn, context) => `withDecorator(${storyFn(context)})`],
  parameters: { a: () => null, b: NaN, c: Symbol('symbol') },
  loaders: [() => Promise.resolve({ d: '3' })],
  args: { x: '1' },
  argTypes: { x: { type: { name: 'string' } } },
};

const strict: XMeta<ButtonArgs> = {
  title: 'simple',
  component: Button,
  decorators: [(storyFn, context) => `withDecorator(${storyFn(context)})`],
  parameters: { a: () => null, b: NaN, c: Symbol('symbol') },
  loaders: [() => Promise.resolve({ d: '3' })],
  args: { x: '1' },
  argTypes: { x: { type: { name: 'string' } } },
};

// NOTE Various story usages
const Simple: XStory = () => 'Simple';

const CSF1Story: XStory = () => 'Named Story';
CSF1Story.story = {
  name: 'Another name for story',
  decorators: [(storyFn) => `Wrapped(${storyFn()}`],
  parameters: { a: [1, '2', {}], b: undefined, c: Button },
  loaders: [() => Promise.resolve({ d: '3' })],
  args: { a: 1 },
};

const CSF2Story: XStory = () => 'Named Story';
CSF2Story.storyName = 'Another name for story';
CSF2Story.decorators = [(storyFn) => `Wrapped(${storyFn()}`];
CSF2Story.parameters = { a: [1, '2', {}], b: undefined, c: Button };
CSF2Story.loaders = [() => Promise.resolve({ d: '3' })];
CSF2Story.args = { a: 1 };

const CSF3Story: XStory = {
  render: (args) => 'Named Story',
  name: 'Another name for story',
  decorators: [(storyFn) => `Wrapped(${storyFn()}`],
  parameters: { a: [1, '2', {}], b: undefined, c: Button },
  loaders: [() => Promise.resolve({ d: '3' })],
  args: { a: 1 },
};

const CSF3StoryStrict: XStory<ButtonArgs> = {
  render: (args) => 'Named Story',
  name: 'Another name for story',
  decorators: [(storyFn) => `Wrapped(${storyFn()}`],
  parameters: { a: [1, '2', {}], b: undefined, c: Button },
  loaders: [() => Promise.resolve({ d: '3' })],
  args: { x: '1' },
  play: async ({ step }) => {
    await step('a step', async ({ step: substep }) => {
      await substep('a substep', () => {});
    });
  },
};

const project: ProjectAnnotations<XFramework> = {
  async runStep(label, play, context) {
    return play(context);
  },
};

test('ArgsFromMeta will infer correct args from render/loader/decorators', () => {
  const decorator1: DecoratorFunction<XFramework, { decoratorArg: string }> = (Story, { args }) =>
    `${args.decoratorArg}`;

  const decorator2: DecoratorFunction<XFramework, { decoratorArg2: string }> = (Story, { args }) =>
    `${args.decoratorArg2}`;

  const loader: LoaderFunction<XFramework, { loaderArg: number }> = async ({ args }) => ({
    loader: `${args.loaderArg}`,
  });

  const loader2: LoaderFunction<XFramework, { loaderArg2: number }> = async ({ args }) => ({
    loader2: `${args.loaderArg2}`,
  });

  const renderer: ArgsStoryFn<XFramework, { theme: string }> = (args) => `${args.theme}`;

  const meta = {
    component: Button,
    args: { disabled: false },
    render: renderer,
    decorators: [decorator1, decorator2],
    loaders: [loader, loader2],
  };
  expectTypeOf<ArgsFromMeta<XFramework, typeof meta>>().toEqualTypeOf<{
    theme: string;
    decoratorArg: string;
    decoratorArg2: string;
    loaderArg: number;
    loaderArg2: number;
  }>();
});
