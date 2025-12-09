import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Avatar,
  AvatarGroup,
  Alert,
  Spinner,
  Skeleton,
  Progress,
  Checkbox,
  Switch,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DataTable,
} from '@/components/ui';
import type { Column } from '@/components/ui/Table';
import { Container } from '@/components/layout/Container';
import { Grid, GridItem } from '@/components/layout/Grid';
import { Stack, HStack, VStack } from '@/components/layout/Stack';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
  Heart,
  Star,
  Download,
  Settings,
  User,
  Moon,
  Sun,
  Monitor,
  Plus,
  Search,
  Bell,
  Calendar,
  Filter,
} from 'lucide-react';

interface SampleData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

const ComponentShowcase: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [progress, setProgress] = useState(45);
  const [switchValue, setSwitchValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);

  const sampleData: SampleData[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'active',
      lastLogin: '2024-01-15',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'User',
      status: 'active',
      lastLogin: '2024-01-14',
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'Manager',
      status: 'inactive',
      lastLogin: '2024-01-10',
    },
  ];

  const columns: Column<SampleData>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      header: 'Role',
      render: (value: string) => <Badge variant='secondary'>{value}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'success' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      sortable: true,
    },
  ];

  const ThemeToggle = () => (
    <div className='flex items-center space-x-2'>
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size='sm'
        onClick={() => setTheme('light')}
      >
        <Sun className='h-4 w-4' />
      </Button>
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size='sm'
        onClick={() => setTheme('system')}
      >
        <Monitor className='h-4 w-4' />
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size='sm'
        onClick={() => setTheme('dark')}
      >
        <Moon className='h-4 w-4' />
      </Button>
    </div>
  );

  return (
    <div className='min-h-screen bg-background'>
      <Container size='2xl' className='py-12'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold text-foreground mb-4'>
              Component Library Showcase
            </h1>
            <p className='text-xl text-muted-foreground mb-8'>
              A comprehensive collection of accessible, animated, and responsive
              components
            </p>
            <div className='flex justify-center'>
              <ThemeToggle />
            </div>
          </div>

          {/* Theme System Demo */}
          <Card className='mb-12' animate>
            <CardHeader>
              <CardTitle>Theme System</CardTitle>
              <CardDescription>
                Switch between light, dark, and system themes. Current theme:{' '}
                {resolvedTheme}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HStack gap={4} wrap align='center'>
                <Badge variant='default'>Primary</Badge>
                <Badge variant='secondary'>Secondary</Badge>
                <Badge variant='success'>Success</Badge>
                <Badge variant='warning'>Warning</Badge>
                <Badge variant='destructive'>Destructive</Badge>
                <Badge variant='info'>Info</Badge>
              </HStack>
            </CardContent>
          </Card>

          {/* Buttons */}
          <Card className='mb-12' animate>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>
                Various button variants, sizes, and states with animations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VStack gap={6}>
                {/* Variants */}
                <div>
                  <h4 className='text-sm font-medium mb-3'>Variants</h4>
                  <HStack gap={2} wrap>
                    <Button variant='default'>Default</Button>
                    <Button variant='secondary'>Secondary</Button>
                    <Button variant='destructive'>Destructive</Button>
                    <Button variant='outline'>Outline</Button>
                    <Button variant='ghost'>Ghost</Button>
                    <Button variant='link'>Link</Button>
                  </HStack>
                </div>

                {/* Sizes */}
                <div>
                  <h4 className='text-sm font-medium mb-3'>Sizes</h4>
                  <HStack gap={2} wrap align='center'>
                    <Button size='sm'>Small</Button>
                    <Button size='default'>Default</Button>
                    <Button size='lg'>Large</Button>
                    <Button size='icon'>
                      <Heart className='h-4 w-4' />
                    </Button>
                  </HStack>
                </div>

                {/* With Icons */}
                <div>
                  <h4 className='text-sm font-medium mb-3'>With Icons</h4>
                  <HStack gap={2} wrap>
                    <Button leftIcon={<Download />}>Download</Button>
                    <Button rightIcon={<Star />}>Star</Button>
                    <Button loading>Loading</Button>
                    <Button disabled>Disabled</Button>
                  </HStack>
                </div>
              </VStack>
            </CardContent>
          </Card>

          {/* Inputs */}
          <Card className='mb-12' animate>
            <CardHeader>
              <CardTitle>Input Components</CardTitle>
              <CardDescription>
                Form inputs with validation, icons, and different states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Grid cols={1} mdCols={2} gap={6}>
                <div>
                  <Input
                    label='Name'
                    placeholder='Enter your name'
                    helperText='This field is required'
                    required
                  />
                </div>
                <div>
                  <Input
                    label='Email'
                    type='email'
                    placeholder='Enter your email'
                    leftIcon={<User />}
                  />
                </div>
                <div>
                  <Input
                    label='Password'
                    type='password'
                    placeholder='Enter your password'
                  />
                </div>
                <div>
                  <Input
                    label='Search'
                    placeholder='Search...'
                    leftIcon={<Search />}
                    rightIcon={<Filter />}
                  />
                </div>
                <div>
                  <Input
                    label='Error State'
                    placeholder='This has an error'
                    error='This field is required'
                    variant='error'
                  />
                </div>
                <div>
                  <Input
                    label='Success State'
                    placeholder='This is successful'
                    variant='success'
                  />
                </div>
              </Grid>
            </CardContent>
          </Card>

          {/* Cards */}
          <Card className='mb-12' animate>
            <CardHeader>
              <CardTitle>Card Components</CardTitle>
              <CardDescription>
                Different card variants with hover effects and animations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Grid cols={1} mdCols={2} lgCols={3} gap={6}>
                <Card variant='default' hoverable animate>
                  <CardHeader>
                    <CardTitle>Default Card</CardTitle>
                    <CardDescription>
                      A standard card with default styling
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-muted-foreground'>
                      This is a default card with some content inside it.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size='sm'>Action</Button>
                  </CardFooter>
                </Card>

                <Card variant='elevated' hoverable animate>
                  <CardHeader>
                    <CardTitle>Elevated Card</CardTitle>
                    <CardDescription>
                      A card with elevated shadow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-muted-foreground'>
                      This card has an elevated appearance with more shadow.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size='sm' variant='secondary'>
                      Action
                    </Button>
                  </CardFooter>
                </Card>

                <Card variant='outlined' hoverable animate>
                  <CardHeader>
                    <CardTitle>Outlined Card</CardTitle>
                    <CardDescription>
                      A card with outlined border
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-muted-foreground'>
                      This card has a prominent outline border.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size='sm' variant='outline'>
                      Action
                    </Button>
                  </CardFooter>
                </Card>
              </Grid>
            </CardContent>
          </Card>

          {/* Avatars */}
          <Card className='mb-12' animate>
            <CardHeader>
              <CardTitle>Avatar Components</CardTitle>
              <CardDescription>
                Profile pictures with fallbacks, status indicators, and groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VStack gap={6}>
                <div>
                  <h4 className='text-sm font-medium mb-3'>Sizes</h4>
                  <HStack gap={4} align='center'>
                    <Avatar size='sm' fallback='SM' />
                    <Avatar size='default' fallback='MD' />
                    <Avatar size='lg' fallback='LG' />
                    <Avatar size='xl' fallback='XL' />
                    <Avatar size='2xl' fallback='2XL' />
                  </HStack>
                </div>

                <div>
                  <h4 className='text-sm font-medium mb-3'>With Status</h4>
                  <HStack gap={4} align='center'>
                    <Avatar fallback='ON' status='online' showStatus />
                    <Avatar fallback='AW' status='away' showStatus />
                    <Avatar fallback='BS' status='busy' showStatus />
                    <Avatar fallback='OF' status='offline' showStatus />
                  </HStack>
                </div>

                <div>
                  <h4 className='text-sm font-medium mb-3'>Avatar Group</h4>
                  <AvatarGroup max={4} animate>
                    <Avatar fallback='JD' />
                    <Avatar fallback='JS' />
                    <Avatar fallback='BW' />
                    <Avatar fallback='AM' />
                    <Avatar fallback='KL' />
                    <Avatar fallback='MN' />
                  </AvatarGroup>
                </div>
              </VStack>
            </CardContent>
          </Card>

          {/* Form Controls */}
          <Card className='mb-12' animate>
            <CardHeader>
              <CardTitle>Form Controls</CardTitle>
              <CardDescription>
                Checkboxes, switches, and other form controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Grid cols={1} mdCols={2} gap={8}>
                <VStack gap={4}>
                  <h4 className='text-sm font-medium'>Checkboxes</h4>
                  <Checkbox
                    label='Accept terms and conditions'
                    description='You must accept the terms to continue'
                    checked={checkboxValue}
                    onCheckedChange={checked =>
                      setCheckboxValue(checked === true)
                    }
                    animate
                  />
                  <Checkbox
                    label='Subscribe to newsletter'
                    description='Get updates about new features'
                    animate
                  />
                  <Checkbox
                    label='Enable notifications'
                    error='This field is required'
                    animate
                  />
                </VStack>

                <VStack gap={4}>
                  <h4 className='text-sm font-medium'>Switches</h4>
                  <Switch
                    label='Dark mode'
                    description='Toggle between light and dark themes'
                    checked={switchValue}
                    onCheckedChange={setSwitchValue}
                    animate
                  />
                  <Switch
                    label='Email notifications'
                    description='Receive email updates'
                    size='sm'
                    animate
                  />
                  <Switch
                    label='Marketing emails'
                    description='Receive promotional content'
                    size='lg'
                    animate
                  />
                </VStack>
              </Grid>
            </CardContent>
          </Card>

          {/* Feedback Components */}
          <Card className='mb-12' animate>
            <CardHeader>
              <CardTitle>Feedback Components</CardTitle>
              <CardDescription>
                Alerts, progress indicators, and loading states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VStack gap={6}>
                {/* Alerts */}
                <div>
                  <h4 className='text-sm font-medium mb-3'>Alerts</h4>
                  <VStack gap={3}>
                    <Alert variant='default' title='Info' dismissible animate>
                      This is an informational alert message.
                    </Alert>
                    <Alert
                      variant='success'
                      title='Success'
                      dismissible
                      animate
                    >
                      Your changes have been saved successfully.
                    </Alert>
                    <Alert
                      variant='warning'
                      title='Warning'
                      dismissible
                      animate
                    >
                      Please review your settings before continuing.
                    </Alert>
                    <Alert
                      variant='destructive'
                      title='Error'
                      dismissible
                      animate
                    >
                      An error occurred while processing your request.
                    </Alert>
                  </VStack>
                </div>

                {/* Progress and Loading */}
                <div>
                  <h4 className='text-sm font-medium mb-3'>
                    Progress & Loading
                  </h4>
                  <VStack gap={4}>
                    <div className='w-full'>
                      <Progress
                        value={progress}
                        showLabel
                        label='Upload Progress'
                        animate
                      />
                      <HStack gap={2} className='mt-2'>
                        <Button
                          size='sm'
                          onClick={() =>
                            setProgress(Math.max(0, progress - 10))
                          }
                        >
                          -10%
                        </Button>
                        <Button
                          size='sm'
                          onClick={() =>
                            setProgress(Math.min(100, progress + 10))
                          }
                        >
                          +10%
                        </Button>
                      </HStack>
                    </div>

                    <div>
                      <h5 className='text-sm font-medium mb-2'>Spinners</h5>
                      <HStack gap={4} align='center'>
                        <Spinner size='sm' />
                        <Spinner size='default' />
                        <Spinner size='lg' />
                        <Spinner size='xl' />
                      </HStack>
                    </div>

                    <div>
                      <h5 className='text-sm font-medium mb-2'>Skeletons</h5>
                      <VStack gap={2}>
                        <Skeleton variant='text' className='w-3/4' />
                        <Skeleton variant='text' className='w-1/2' />
                        <HStack gap={2}>
                          <Skeleton variant='avatar' className='w-10 h-10' />
                          <VStack gap={1} className='flex-1'>
                            <Skeleton variant='text' className='w-full' />
                            <Skeleton variant='text' className='w-2/3' />
                          </VStack>
                        </HStack>
                      </VStack>
                    </div>
                  </VStack>
                </div>
              </VStack>
            </CardContent>
          </Card>

          {/* Dialog */}
          <Card className='mb-12' animate>
            <CardHeader>
              <CardTitle>Dialog Components</CardTitle>
              <CardDescription>
                Modal dialogs with animations and focus management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HStack gap={4}>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent animate>
                    <DialogHeader>
                      <DialogTitle>Dialog Title</DialogTitle>
                      <DialogDescription>
                        This is a sample dialog with animated entrance and focus
                        management.
                      </DialogDescription>
                    </DialogHeader>
                    <div className='py-4'>
                      <Input placeholder='Focus is trapped here...' />
                    </div>
                    <DialogFooter>
                      <Button
                        variant='outline'
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => setDialogOpen(false)}>
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </HStack>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card animate>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
              <CardDescription>
                Advanced table with sorting, searching, and pagination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={sampleData}
                columns={columns}
                searchable
                sortable
                animate
                variant='striped'
                onRowClick={row => console.log('Clicked row:', row)}
              />
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
};

export default ComponentShowcase;
