<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class ElectricityPriceTiersTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('electricity_price_tiers');
        $this->setDisplayField('tier_order');
        $this->setPrimaryKey('id');
    }

    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->integer('tier_order')
            ->requirePresence('tier_order', 'create')
            ->notEmptyString('tier_order')
            ->greaterThanOrEqual('tier_order', 1);          //>=

        $validator
            ->decimal('from_kwh')                           //thap phan
            ->requirePresence('from_kwh', 'create')
            ->notEmptyString('from_kwh')
            ->greaterThanOrEqual('from_kwh', 0);               

        $validator
            ->decimal('to_kwh')
            ->allowEmptyString('to_kwh')
            ->greaterThanOrEqual('to_kwh', 0)
            ->add('to_kwh', 'greaterThanFromKwh', [
                'rule' => function ($value, array $context): bool {
                    if ($value === null || $value === '') {
                        return true;
                    }

                    $fromKwh = $context['data']['from_kwh'] ?? null;

                    //Rule decimal sẽ xử lý riêng nếu dữ liệu không phải số
                    if (!is_numeric($value) || !is_numeric($fromKwh)) {
                        return true;
                    }

                    return (float)$value > (float)$fromKwh;
                },
                'message' => 'Mức kết thúc phải lớn hơn mức bắt đầu',
            ]);

        $validator
            ->decimal('price_kwh')
            ->requirePresence('price_kwh', 'create')
            ->notEmptyString('price_kwh')
            ->greaterThan('price_kwh', 0);                  //>

        $validator
            ->date('effective_from')
            ->requirePresence('effective_from', 'create')
            ->notEmptyDate('effective_from');

        return $validator;
    }

    public function buildRules(RulesChecker $rules): RulesChecker           //check rang buoc
    {
        $rules->add(
            $rules->isUnique(['effective_from', 'tier_order']),       //effective_from - trong 1 ngay ap dung Khong co tier_order - bac dien Trung nhau
            ['errorField' => 'tier_order']
        );

        return $rules;
    }
}
