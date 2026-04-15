<?php
declare(strict_types=1);

namespace App\Controller;

/**
 * EnergyLogs Controller
 *
 * @property \App\Model\Table\EnergyLogsTable $EnergyLogs
 */
class EnergyLogsController extends AppController
{
    /**
     * Index method
     *
     * @return \Cake\Http\Response|null|void Renders view
     */
    public function index()
    {
        $query = $this->EnergyLogs->find()
            ->contain(['Devices']);
        $energyLogs = $this->paginate($query);

        $this->set(compact('energyLogs'));
    }

    /**
     * View method
     *
     * @param string|null $id Energy Log id.
     * @return \Cake\Http\Response|null|void Renders view
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function view($id = null)
    {
        $energyLog = $this->EnergyLogs->get($id, contain: ['Devices']);
        $this->set(compact('energyLog'));
    }

    /**
     * Add method
     *
     * @return \Cake\Http\Response|null|void Redirects on successful add, renders view otherwise.
     */
    public function add()
    {
        $energyLog = $this->EnergyLogs->newEmptyEntity();
        if ($this->request->is('post')) {
            $energyLog = $this->EnergyLogs->patchEntity($energyLog, $this->request->getData());
            if ($this->EnergyLogs->save($energyLog)) {
                $this->Flash->success(__('The energy log has been saved.'));

                return $this->redirect(['action' => 'index']);
            }
            $this->Flash->error(__('The energy log could not be saved. Please, try again.'));
        }
        $devices = $this->EnergyLogs->Devices->find('list', limit: 200)->all();
        $this->set(compact('energyLog', 'devices'));

        $this->viewBuilder()->setClassName('Json');
    }

    /**
     * Edit method
     *
     * @param string|null $id Energy Log id.
     * @return \Cake\Http\Response|null|void Redirects on successful edit, renders view otherwise.
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function edit($id = null)
    {
        $energyLog = $this->EnergyLogs->get($id, contain: []);
        if ($this->request->is(['patch', 'post', 'put'])) {
            $energyLog = $this->EnergyLogs->patchEntity($energyLog, $this->request->getData());
            if ($this->EnergyLogs->save($energyLog)) {
                $this->Flash->success(__('The energy log has been saved.'));

                return $this->redirect(['action' => 'index']);
            }
            $this->Flash->error(__('The energy log could not be saved. Please, try again.'));
        }
        $devices = $this->EnergyLogs->Devices->find('list', limit: 200)->all();
        $this->set(compact('energyLog', 'devices'));
    }

    /**
     * Delete method
     *
     * @param string|null $id Energy Log id.
     * @return \Cake\Http\Response|null Redirects to index.
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function delete($id = null)
    {
        $this->request->allowMethod(['post', 'delete']);
        $energyLog = $this->EnergyLogs->get($id);
        if ($this->EnergyLogs->delete($energyLog)) {
            $this->Flash->success(__('The energy log has been deleted.'));
        } else {
            $this->Flash->error(__('The energy log could not be deleted. Please, try again.'));
        }

        return $this->redirect(['action' => 'index']);
    }
}
