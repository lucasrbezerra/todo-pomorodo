import { useEffect, useMemo, useState } from 'react';
import {
  Text,
  Title,
  Container,
  Box,
  Timer,
  Task,
  TaskList,
  Button,
  Content,
  Subtitle,
  Input,
  Modal,
  Image,
  ConfirmationModal,
  InputTime,
} from '../components';
import { useTasks } from '../hooks';
import { useModal } from '../hooks';

import { useTheme } from 'styled-components';
import { ThemeType } from '../themes';

const STAGES = {
  READY: 0,
  RUNNING: 1,
  FINISHED: 2,
};

const MODAL_TYPE = {
  CLEAR: 'clear',
  INPUT_TIME: 'input-time',
};

const DEFAULT_TIME = 25 * 60;

let countdownTimeout: NodeJS.Timeout;

export const Home = () => {
  const [time, setTime] = useState(DEFAULT_TIME);
  const [stage, setStage] = useState(STAGES['READY']);
  const [modalType, setModalType] = useState<string>(MODAL_TYPE['CLEAR']);
  const [taskName, setTaskName] = useState('');
  const [error, setError] = useState(false);
  const { tasks, currentTask, createTask, jumpTask, deleteTask, editTask, clearTasks, updateToDone, getValidTasks } =
    useTasks();
  const { toggle, isShown } = useModal();
  const theme = useTheme() as ThemeType;

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const handleChangeTime = () => {
    setModalType(MODAL_TYPE['INPUT_TIME']);
    toggle();
  };

  const onConfirmTime = () => {
    console.log('ConfirmTime');
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskName(e.target.value);
    if (taskName.length > 0) {
      setError(false);
    } else {
      setError(true);
    }
  };

  const onChangeTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      if (taskName.length > 0) {
        createTask(taskName);
        setTaskName('');
      } else {
        setError(true);
      }
    }
  };

  useEffect(() => {
    if (stage === STAGES['RUNNING'] && time > 0) {
      countdownTimeout = setTimeout(() => {
        setTime(time - 1);
      }, 1000);
    } else if (stage === STAGES['RUNNING'] && time === 0) {
      setStage(STAGES['FINISHED']);
    }
  }, [stage, time]);

  const handleStartTimer = () => {
    setStage(STAGES['RUNNING']);
  };

  const resetCountdown = () => {
    clearTimeout(countdownTimeout);
    setStage(STAGES['READY']);
    setTime(DEFAULT_TIME);
  };

  const handleNext = () => {
    jumpTask();
    resetCountdown();
  };

  const handleCleanAll = () => {
    clearTasks();
    resetCountdown();
    toggle();
  };

  const handleAddTask = () => {
    if (taskName.length > 0) {
      createTask(taskName);
      setTaskName('');
    } else {
      setError(true);
    }
  };

  const handleDone = () => {
    resetCountdown();
    if (!!currentTask) {
      updateToDone(currentTask, true);
      jumpTask();
    }
  };

  const handleStageTitle = useMemo(() => {
    switch (stage) {
      case 0:
        return <Title>Pronto!</Title>;
      case 1:
        return <Title>Trabalhando!</Title>;
      case 2:
        return <Title>Mais uma?!</Title>;
    }
  }, [handleStartTimer, handleDone, resetCountdown, stage]);

  const handleStageButtons = useMemo(() => {
    switch (stage) {
      case 0:
        return (
          <Content width="100%" mt="3rem" justifyContent="center" alignItems="center" display="flex">
            <Button
              width="200px"
              height="50px"
              label="Iniciar"
              mIcon="0 .35rem 0 0"
              bg={`${theme.colors.primary}`}
              onClick={handleStartTimer}
            />
          </Content>
        );

      case 1:
        return (
          <Content width="100%" mt="3rem" justifyContent="center" alignItems="center" display="flex">
            <Button
              width="200px"
              height="50px"
              label="Desistir"
              icon="fas fa-ban"
              mIcon="0 .35rem 0 0"
              bg={`${theme.colors.failure}`}
              onClick={resetCountdown}
            />
          </Content>
        );

      case 2:
        return (
          <Content width="100%" mt="3rem" justifyContent="center" alignItems="center" display="flex">
            <Button
              width="200px"
              height="50px"
              label="Pronto!"
              mIcon="0 .35rem 0 0"
              icon="far fa-check-circle"
              bg={`${theme.colors.success}`}
              onClick={handleDone}
            />
            <Button
              width="120px"
              height="30px"
              label="Repita!"
              mIcon="0 .35rem 0 0"
              icon="fas fa-redo"
              bg={`${theme.colors.failure}`}
              onClick={resetCountdown}
            />
          </Content>
        );

      default:
        return (
          <Content width="100%" mt="3rem" justifyContent="center" alignItems="center" display="flex">
            <Button
              width="200px"
              height="50px"
              label="Iniciar"
              bg={`${theme.colors.primary}`}
              onClick={handleStartTimer}
            />
          </Content>
        );
    }
  }, [handleStartTimer, handleDone, resetCountdown, stage]);

  return (
    <Container>
      <Box>
        <Content m="0 auto" width="400px" borderBottom={`1px solid ${theme.colors.shadow}`}>
          {handleStageTitle}
          {currentTask ? (
            <Content p="3rem 0">
              <Subtitle>Tarefa Atual</Subtitle>
              <Task width="400px" m="1rem 0 0 0" task={currentTask}>
                <Content display="flex" position="absolute" right="16px">
                  {getValidTasks().length > 1 && (
                    <Button
                      width="80px"
                      height="25px"
                      label="Pular"
                      icon="fas fa-angle-double-right"
                      onClick={handleNext}
                    />
                  )}
                </Content>
              </Task>
            </Content>
          ) : (
            <Content p="1rem 0" display="flex" alignItems="center" flexDirection="column" justifyContent="space-evenly">
              <Image src="empty_task.svg" alt="Create Task" />
              <Subtitle color="light" mt="1rem">
                Crie tarefas agora!
              </Subtitle>
            </Content>
          )}
        </Content>
        <Timer minutes={minutes} seconds={seconds} onClick={handleChangeTime} />
        {handleStageButtons}
      </Box>
      <Box>
        <Content m="0 auto" width="450px" borderBottom={`1px solid ${theme.colors.shadow}`}>
          <Title>Tarefas</Title>
          <Content display="flex" alignItems="center" p="1rem 0 1.5rem 0">
            <Input
              autoFocus
              placeholder="Entre com uma tarefa nova..."
              error={error}
              value={taskName}
              onChange={onChange}
              onClick={handleAddTask}
              onKeyDown={onKeyDown}
            />
            <Button width="100px" height="40px" label="Limpar" onClick={() => toggle()} />
          </Content>
        </Content>
        <TaskList
          tasks={tasks}
          currentTask={currentTask}
          resetCountdown={resetCountdown}
          deleteTask={deleteTask}
          editTask={editTask}
        />
      </Box>
      <Modal
        isShown={isShown}
        hide={toggle}
        headerText={modalType === MODAL_TYPE['CLEAR'] ? 'Limpar tudo' : 'Escolha um tempo'}
        modalContent={
          modalType === MODAL_TYPE['CLEAR'] ? (
            <ConfirmationModal
              onConfirm={handleCleanAll}
              onCancel={() => toggle()}
              message="Tem certeza que quer deletar TODAS as tarefa?"
            />
          ) : (
            <Content width="250px">
              <InputTime
                autoFocus
                placeholder="Escolha um tempo"
                error={error}
                value={time}
                onChange={onChangeTime}
                icon={false}
                width="100%"
                onKeyDown={onKeyDown}
              />
              <ConfirmationModal onConfirm={onConfirmTime} haveNoButton={false} />
            </Content>
          )
        }
      />
    </Container>
  );
};
